import db from './database'
import type { EntradaConfig, ValorConfig } from './schema'

export const CHAVES = {
  tema: 'tema',
  ultimoBackupEm: 'ultimoBackupEm',
} as const

export async function definir(chave: string, valor: ValorConfig): Promise<void> {
  await db.config.put({ chave, valor })
}

export async function listar(): Promise<EntradaConfig[]> {
  return db.config.toArray()
}

export async function limpar(): Promise<void> {
  await db.config.clear()
}
