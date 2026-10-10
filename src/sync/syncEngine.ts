import {
  ErroApi,
  ErroRede,
  enviarPush,
  obterSessao,
  puxar,
} from './api'
import {
  LIMITE_LOTE_PUSH,
  compactarParaEnvio,
  contarPendentes,
  paraWire,
  removerConfirmadas,
  aoMudarOutbox,
} from '../db/outbox.repo'
import * as syncState from '../db/sync-state.repo'
import type { Item } from '../db/schema'
import { aplicarRemoto } from '../features/items/items.repo'

export type FaseSync = 'parado' | 'ocioso' | 'sincronizando' | 'sem-sessao' | 'sem-conexao' | 'erro'

export interface StatusSync {
  fase: FaseSync
  pendentes: number
  ultimaSincronizacao: number | null
  ultimoErro: string | null
  proximaTentativaEm: number | null
}

const TIMEOUT_BACKOFF_BASE_MS = 2_000
const TIMEOUT_BACKOFF_MAX_MS = 5 * 60_000
const DEBOUNCE_ESCRITA_MS = 1_500
const LIMITE_PULL = 500
const MAX_PAGINAS_PULL = 10
const MAX_LOTES_PUSH = 20

let status: StatusSync = {
  fase: 'parado',
  pendentes: 0,
  ultimaSincronizacao: null,
  ultimoErro: null,
  proximaTentativaEm: null,
}

const ouvintes = new Set<(status: StatusSync) => void>()

function publicar(parcial: Partial<StatusSync>): void {
  status = { ...status, ...parcial }
  for (const ouvinte of ouvintes) ouvinte(status)
}

export function obterStatus(): StatusSync {
  return status
}

export function assinarStatus(ouvinte: (status: StatusSync) => void): () => void {
  ouvintes.add(ouvinte)
  ouvinte(status)
  return () => ouvintes.delete(ouvinte)
}

let rodando = false
let reexecutar = false
let tentativas = 0
let timerTentativa: ReturnType<typeof setTimeout> | null = null
let timerDebounce: ReturnType<typeof setTimeout> | null = null

function proximoBackoff(): number {
  const ms = Math.min(TIMEOUT_BACKOFF_MAX_MS, TIMEOUT_BACKOFF_BASE_MS * 2 ** tentativas)
  tentativas += 1
  return ms
}

function agendarTentativa(ms: number): void {
  if (timerTentativa !== null) clearTimeout(timerTentativa)
  timerTentativa = setTimeout(() => {
    timerTentativa = null
    void rodar()
  }, ms)
  publicar({ proximaTentativaEm: Date.now() + ms })
}

async function push(): Promise<void> {
  for (let lote = 0; lote < MAX_LOTES_PUSH; lote += 1) {
    const { envio, descartaveis } = await compactarParaEnvio(LIMITE_LOTE_PUSH)
    if (envio.length === 0) return
    const resposta = await enviarPush(envio.map(paraWire))
    const porId = new Map(resposta.resultados.map((resultado) => [resultado.mutacaoId, resultado]))
    const confirmados: string[] = [...descartaveis]
    const vencedoresRemotos: Item[] = []
    for (const entrada of envio) {
      const resultado = porId.get(entrada.id)
      if (resultado === undefined) continue
      confirmados.push(entrada.id)
      // 'ignorada': servidor ficou com a versão mais nova → reconcilia local,
      // mas só se não houver edição local mais recente (aplicarRemoto decide).
      if (resultado.status === 'ignorada' && resultado.registro !== undefined) {
        vencedoresRemotos.push(resultado.registro)
      }
    }
    await removerConfirmadas(confirmados)
    for (const vencedor of vencedoresRemotos) {
      await aplicarRemoto([vencedor])
    }
    if (envio.length < LIMITE_LOTE_PUSH) return
  }
}

async function pull(): Promise<void> {
  for (let pagina = 0; pagina < MAX_PAGINAS_PULL; pagina += 1) {
    const { cursor } = await syncState.obter()
    const resposta = await puxar(cursor, LIMITE_PULL)
    if (resposta.registros.length > 0) {
      await aplicarRemoto(resposta.registros)
    }
    await syncState.definirCursor(resposta.proximoCursor)
    if (!resposta.temMais) return
  }
}

async function rodar(): Promise<void> {
  if (rodando) {
    reexecutar = true
    return
  }
  rodando = true
  reexecutar = false
  publicar({ fase: 'sincronizando', ultimoErro: null, proximaTentativaEm: null })
  try {
    const estado = await syncState.obter()
    let sessao = estado.sessao

    let sessaoServico: Awaited<ReturnType<typeof obterSessao>> | 'rede'
    try {
      sessaoServico = await obterSessao()
    } catch (erro) {
      if (erro instanceof ErroRede) sessaoServico = 'rede'
      else throw erro
    }

    if (sessaoServico === 'rede') {
      const pendentes = await contarPendentes()
      if (sessao !== null) {
        const ms = proximoBackoff()
        agendarTentativa(ms)
        publicar({ fase: 'sem-conexao', pendentes })
      } else {
        // Sem conta e sem rede: app segue 100% local, sem alarme.
        publicar({ fase: 'ocioso', pendentes })
      }
      return
    }

    if (sessaoServico === null) {
      if (sessao !== null) await syncState.definirSessao(null)
      publicar({ fase: 'sem-sessao', pendentes: await contarPendentes() })
      return
    }

    sessao = sessaoServico
    await syncState.definirSessao(sessao)

    await push()
    await pull()

    const ultimaSincronizacao = Date.now()
    await syncState.marcarSincronizacao(ultimaSincronizacao)
    tentativas = 0
    publicar({
      fase: 'ocioso',
      pendentes: await contarPendentes(),
      ultimaSincronizacao,
      proximaTentativaEm: null,
    })
  } catch (erro) {
    const pendentes = await contarPendentes().catch(() => status.pendentes)
    const ehApi401 = erro instanceof ErroApi && erro.status === 401
    if (ehApi401) {
      await syncState.definirSessao(null)
      publicar({ fase: 'sem-sessao', pendentes })
      return
    }
    const ehRede = erro instanceof ErroRede
    const ms = proximoBackoff()
    agendarTentativa(ms)
    publicar({
      fase: ehRede ? 'sem-conexao' : 'erro',
      pendentes,
      ultimoErro: erro instanceof Error ? erro.message : String(erro),
    })
  } finally {
    rodando = false
    if (reexecutar) {
      reexecutar = false
      if (status.fase === 'ocioso') void rodar()
    }
  }
}

export async function sincronizarAgora(): Promise<void> {
  tentativas = 0
  if (timerTentativa !== null) {
    clearTimeout(timerTentativa)
    timerTentativa = null
  }
  publicar({ proximaTentativaEm: null })
  await rodar()
}

function agendarPorEscrita(): void {
  if (status.fase === 'sem-sessao' || status.fase === 'parado') return
  if (timerDebounce !== null) clearTimeout(timerDebounce)
  timerDebounce = setTimeout(() => {
    timerDebounce = null
    void rodar()
  }, DEBOUNCE_ESCRITA_MS)
}

let iniciado = false

export function iniciarSync(): void {
  if (iniciado) return
  iniciado = true
  aoMudarOutbox(agendarPorEscrita)
  window.addEventListener('online', () => {
    void sincronizarAgora()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void sincronizarAgora()
  })
  void rodar()
}

if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__sync = {
    status: obterStatus,
    agora: sincronizarAgora,
  }
}
