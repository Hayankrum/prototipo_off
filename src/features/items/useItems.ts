import { useLiveQuery } from 'dexie-react-hooks'
import type { FiltroItens, Item } from '../../db/schema'
import * as itemsRepo from './items.repo'

export interface OpcoesItens {
  busca?: string
  filtro?: FiltroItens
}

export function useItems({ busca = '', filtro = 'todos' }: OpcoesItens = {}): Item[] {
  return useLiveQuery(() => itemsRepo.listar({ busca, filtro }), [busca, filtro], [] as Item[])
}

interface Estatisticas {
  total: number
  concluidos: number
  pendentes: number
}

const ESTATISTICAS_VAZIA: Estatisticas = { total: 0, concluidos: 0, pendentes: 0 }

export function useItemsStats(): Estatisticas {
  return useLiveQuery(async () => {
    const itens = await itemsRepo.listar()
    const concluidos = itens.filter((item) => item.concluido).length
    return { total: itens.length, concluidos, pendentes: itens.length - concluidos }
  }, [], ESTATISTICAS_VAZIA)
}
