import db from './database'
import { CHAVE_SYNC_GLOBAL, type EstadoSync, type SessaoLocal } from './schema'

const PADRAO: EstadoSync = {
  chave: CHAVE_SYNC_GLOBAL,
  cursor: '0',
  ultimaSincronizacao: null,
  sessao: null,
}

export async function obter(): Promise<EstadoSync> {
  const existente = await db.syncState.get(CHAVE_SYNC_GLOBAL)
  return existente ?? { ...PADRAO }
}

async function gravar(atualizado: Partial<Omit<EstadoSync, 'chave'>>): Promise<void> {
  const atual = await obter()
  await db.syncState.put({ ...atual, ...atualizado, chave: CHAVE_SYNC_GLOBAL })
}

export async function definirCursor(cursor: string): Promise<void> {
  await gravar({ cursor })
}

export async function marcarSincronizacao(ultimaSincronizacao: number = Date.now()): Promise<void> {
  await gravar({ ultimaSincronizacao })
}

export async function definirSessao(sessao: SessaoLocal | null): Promise<void> {
  await gravar({ sessao })
}
