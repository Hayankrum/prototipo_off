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
  items: 'id, criadoEm, concluido, deletadoEm',
  config: 'chave',
})

db.version(2)
  .stores({
    items: 'id, criadoEm, concluido, updatedAt, deletedAt, serverVersion',
    config: 'chave',
    outbox: 'id, tabela, registroId, criadoEm',
    syncState: 'chave',
  })
  .upgrade((tx) =>
    tx.table('items').toCollection().modify((registro) => {
      const item = registro as Item & { atualizadoEm?: number; deletadoEm?: number }
      if (typeof item.atualizadoEm === 'number') {
        item.updatedAt = item.atualizadoEm
      } else if (typeof item.updatedAt !== 'number') {
        item.updatedAt = typeof item.criadoEm === 'number' ? item.criadoEm : Date.now()
      }
      delete item.atualizadoEm
      if (typeof item.deletadoEm === 'number') {
        item.deletedAt = item.deletadoEm
      }
      delete item.deletadoEm
    }),
  )

export default db
