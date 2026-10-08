import db from '../../db/database'
import type { FiltroItens, Item } from '../../db/schema'
import { gerarId } from '../../shared/lib/id'

export interface OpcoesListagem {
  busca?: string
  filtro?: FiltroItens
}

export interface EntradaItem {
  titulo: string
  descricao: string
}

export async function listar({ busca = '', filtro = 'todos' }: OpcoesListagem = {}): Promise<Item[]> {
  const termo = busca.trim().toLowerCase()
  const itens = await db.items.orderBy('criadoEm').reverse().toArray()
  return itens.filter((item) => {
    if (item.deletadoEm !== undefined) return false
    if (filtro === 'pendentes' && item.concluido) return false
    if (filtro === 'concluidos' && !item.concluido) return false
    if (termo === '') return true
    return `${item.titulo} ${item.descricao}`.toLowerCase().includes(termo)
  })
}

export async function listarParaBackup(): Promise<Item[]> {
  return db.items.orderBy('criadoEm').toArray()
}

export async function criar(entrada: EntradaItem): Promise<string> {
  const agora = Date.now()
  const id = gerarId()
  await db.items.add({
    id,
    titulo: entrada.titulo.trim(),
    descricao: entrada.descricao.trim(),
    concluido: false,
    criadoEm: agora,
    atualizadoEm: agora,
  })
  return id
}

export async function atualizar(id: string, entrada: EntradaItem): Promise<void> {
  await db.items.update(id, {
    titulo: entrada.titulo.trim(),
    descricao: entrada.descricao.trim(),
    atualizadoEm: Date.now(),
  })
}

export async function alternarConcluido(item: Item): Promise<void> {
  await db.items.update(item.id, {
    concluido: !item.concluido,
    atualizadoEm: Date.now(),
  })
}

export async function excluir(id: string): Promise<void> {
  const agora = Date.now()
  await db.items.update(id, { deletadoEm: agora, atualizadoEm: agora })
}

export async function limparTodos(): Promise<void> {
  await db.items.clear()
}

export async function substituirTodos(itens: Item[]): Promise<void> {
  await db.transaction('rw', db.items, async () => {
    await db.items.clear()
    if (itens.length > 0) await db.items.bulkPut(itens)
  })
}

export async function mesclar(itens: Item[]): Promise<number> {
  const existentes = new Map((await db.items.toArray()).map((item) => [item.id, item]))
  const paraGravar: Item[] = []
  for (const importado of itens) {
    const atual = existentes.get(importado.id)
    if (atual === undefined || importado.atualizadoEm >= atual.atualizadoEm) {
      paraGravar.push(importado)
    }
  }
  if (paraGravar.length > 0) await db.items.bulkPut(paraGravar)
  return paraGravar.length
}
