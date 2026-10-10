import Dexie, { type EntityTable } from 'dexie'
import appConfig from '../app/app.config.json'
import type { EntradaConfig, EntradaOutbox, EstadoSync, Item } from './schema'

const db = new Dexie(appConfig.dbName) as Dexie & {
  items: EntityTable<Item, 'id'>
  config: EntityTable<EntradaConfig, 'chave'>
  outbox: EntityTable<EntradaOutbox, 'id'>
  syncState: EntityTable<EstadoSync, 'chave'>
}

db.version(1).stores({
  items: 'id, criadoEm, concluido, updatedAt, deletedAt, serverVersion',
  config: 'chave',
  outbox: 'id, tabela, registroId, criadoEm',
  syncState: 'chave',
})

export default db
