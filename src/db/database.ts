import Dexie, { type EntityTable } from 'dexie'
import appConfig from '../app/app.config.json'
import type { EntradaConfig, Item } from './schema'

const db = new Dexie(appConfig.dbName) as Dexie & {
  items: EntityTable<Item, 'id'>
  config: EntityTable<EntradaConfig, 'chave'>
}

db.version(1).stores({
  items: 'id, criadoEm, concluido, deletadoEm',
  config: 'chave',
})

// Para evoluir o schema, adicione uma nova versão com upgrade:
//
// db.version(2)
//   .stores({ items: 'id, criadoEm, concluido, deletadoEm, prioridade', config: 'chave' })
//   .upgrade((tx) =>
//     tx.table('items').toCollection().modify((item) => {
//       item.prioridade = 0
//     }),
//   )

export default db
