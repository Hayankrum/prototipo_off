import db from '../../db/database'
import { definir, obter } from '../../db/config.repo'
import { novaMutacao } from '../../db/outbox.repo'
import * as syncState from '../../db/sync-state.repo'
import type { SessaoLocal } from '@shared/schemas/usuario'

export const CHAVE_ULTIMO_USUARIO = 'ultimoUsuarioId'

const TABELA = 'items'

/**
 * Enfileira na outbox todos os itens que ainda não têm mutação pendente,
 * inclusive tombstones (`deletedAt`) — a primeira sincronização após o login
 * leva o estado completo sem duplicar (a compactação por registro já garante
 * uma única mutação por item).
 */
export async function enfileirarItensParaSync(): Promise<number> {
  let enfileiradas = 0
  await db.transaction('rw', db.items, db.outbox, async () => {
    const pendentes = new Set(
      (await db.outbox.toArray()).map((entrada) => `${entrada.tabela}:${entrada.registroId}`),
    )
    const agora = Date.now()
    const itens = await db.items.toArray()
    const mutacoes = itens
      .filter((item) => !pendentes.has(`${TABELA}:${item.id}`))
      .map((item) =>
        novaMutacao(
          TABELA,
          item,
          item.deletedAt !== undefined ? 'delete' : 'upsert',
          agora,
        ),
      )
    if (mutacoes.length > 0) {
      await db.outbox.bulkAdd(mutacoes)
      enfileiradas = mutacoes.length
    }
  })
  return enfileiradas
}

/**
 * Apaga itens, outbox e reseta o cursor — usado ao entrar com uma conta
 * diferente da anterior, para não levar dados de uma conta para outra.
 */
export async function apagarDadosLocais(): Promise<void> {
  await db.transaction('rw', db.items, db.outbox, db.syncState, async () => {
    await db.items.clear()
    await db.outbox.clear()
    await syncState.definirCursor('0')
  })
}

export type ResultadoPreparacao = 'mesmo-usuario' | 'conta-alterada' | 'primeiro-acesso'

/**
 * Chamado logo após entrar/criar conta, antes da primeira sincronização:
 * grava a sessão local, então
 * - mesma conta (ou primeiro acesso): enfileira o que falta (tudo, se for a
 *   primeira sincronização da vida deste aparelho);
 * - conta diferente: apaga os dados locais para não misturar contas.
 */
export async function conectar(sessao: SessaoLocal): Promise<ResultadoPreparacao> {
  await syncState.definirSessao(sessao)
  const anterior = await obter(CHAVE_ULTIMO_USUARIO)
  let resultado: ResultadoPreparacao
  if (anterior === undefined || anterior === null) {
    await enfileirarItensParaSync()
    resultado = 'primeiro-acesso'
  } else if (anterior === sessao.usuarioId) {
    await enfileirarItensParaSync()
    resultado = 'mesmo-usuario'
  } else {
    await apagarDadosLocais()
    resultado = 'conta-alterada'
  }
  await definir(CHAVE_ULTIMO_USUARIO, sessao.usuarioId)
  return resultado
}

/** Sai da conta no servidor e limpa a sessão local (os dados ficam no aparelho). */
export async function desconectar(): Promise<void> {
  await syncState.definirSessao(null)
}
