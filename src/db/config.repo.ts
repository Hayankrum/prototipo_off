import db from './database'
import type { EntradaConfig, ValorConfig } from './schema'

export const CHAVES = {
  tema: 'tema',
  ultimoBackupEm: 'ultimoBackupEm',
  // Conta dona dos dados locais: se divergir da sessão do cookie, os itens
  // locais pertencem a outra conta e o sync nunca pode enviá-los.
  ultimoUsuarioId: 'ultimoUsuarioId',
  // true enquanto uma troca de conta está em andamento (antes do cookie mudar).
  transicaoConta: 'transicaoConta',
} as const

export async function definir(chave: string, valor: ValorConfig): Promise<void> {
  await db.config.put({ chave, valor })
}

export async function remover(chave: string): Promise<void> {
  await db.config.delete(chave)
}

export async function obter(chave: string): Promise<ValorConfig | undefined> {
  const entrada = await db.config.get(chave)
  return entrada?.valor
}

export async function listar(): Promise<EntradaConfig[]> {
  return db.config.toArray()
}

export async function limpar(): Promise<void> {
  await db.config.clear()
}

/** Apaga tudo menos as chaves de proteção de conta informadas. */
export async function limparExceto(manter: string[]): Promise<void> {
  const manterSet = new Set(manter)
  const chaves = (await db.config.toArray()).map((entrada) => entrada.chave)
  const apagar = chaves.filter((chave) => !manterSet.has(chave))
  if (apagar.length > 0) await db.config.bulkDelete(apagar)
}
