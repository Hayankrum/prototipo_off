import db from './database'
import type { EntradaOutbox, Item, OperacaoOutbox } from './schema'
import type { Mutacao } from '@shared/schemas/outbox'
import { gerarId } from '../shared/lib/id'

export const LIMITE_LOTE_PUSH = 100

export function novaMutacao(
  tabela: string,
  registro: Item,
  operacao: OperacaoOutbox,
  criadoEm: number,
): EntradaOutbox {
  return {
    id: gerarId(),
    tabela,
    registroId: registro.id,
    operacao,
    payload: registro,
    criadoEm,
    tentativas: 0,
  }
}

export function paraWire(entrada: EntradaOutbox): Mutacao {
  return {
    id: entrada.id,
    tabela: entrada.tabela,
    registroId: entrada.registroId,
    operacao: entrada.operacao,
    payload: entrada.payload,
  }
}

export async function contarPendentes(): Promise<number> {
  return db.outbox.count()
}

export interface LoteCompactado {
  envio: EntradaOutbox[]
  descartaveis: string[]
}

function chaveMutacao(entrada: EntradaOutbox): string {
  return `${entrada.tabela}:${entrada.registroId}`
}

export async function compactarParaEnvio(
  limite: number = LIMITE_LOTE_PUSH,
): Promise<LoteCompactado> {
  const todas = await db.outbox.orderBy('criadoEm').toArray()
  const ultimaPorChave = new Map<string, EntradaOutbox>()
  for (const entrada of todas) {
    ultimaPorChave.set(chaveMutacao(entrada), entrada)
  }
  const envio = Array.from(ultimaPorChave.values()).slice(0, limite)
  const chavesEnvio = new Set(envio.map(chaveMutacao))
  const descartaveis = todas
    .filter(
      (entrada) =>
        chavesEnvio.has(chaveMutacao(entrada)) &&
        entrada.id !== ultimaPorChave.get(chaveMutacao(entrada))?.id,
    )
    .map((entrada) => entrada.id)
  return { envio, descartaveis }
}

export async function removerConfirmadas(ids: string[]): Promise<void> {
  if (ids.length > 0) await db.outbox.bulkDelete(ids)
}

type Ouvinte = () => void
const ouvintes = new Set<Ouvinte>()

export function aoMudarOutbox(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

db.outbox.hook('creating', () => {
  for (const ouvinte of ouvintes) ouvinte()
})
