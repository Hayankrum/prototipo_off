export interface Item {
  id: string
  titulo: string
  descricao: string
  concluido: boolean
  criadoEm: number
  atualizadoEm: number
  deletadoEm?: number
}

export type ValorConfig = string | number | boolean | null

export interface EntradaConfig {
  chave: string
  valor: ValorConfig
}

export type Tema = 'claro' | 'escuro' | 'sistema'

export type FiltroItens = 'todos' | 'pendentes' | 'concluidos'

export const SCHEMA_VERSION = 1
