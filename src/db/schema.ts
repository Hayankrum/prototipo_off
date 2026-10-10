export interface Item {
  id: string
  titulo: string
  descricao: string
  concluido: boolean
  criadoEm: number
  updatedAt: number
  deletedAt?: number
  serverVersion?: number
}

export type ValorConfig = string | number | boolean | null

export interface EntradaConfig {
  chave: string
  valor: ValorConfig
}

export type OperacaoOutbox = 'upsert' | 'delete'

export interface EntradaOutbox {
  id: string
  tabela: string
  registroId: string
  operacao: OperacaoOutbox
  payload: Item
  criadoEm: number
  tentativas: number
}

export interface SessaoLocal {
  usuarioId: string
  email: string
  nome: string | null
  expiraEm: number | null
}

export interface EstadoSync {
  chave: string
  cursor: string
  ultimaSincronizacao: number | null
  sessao: SessaoLocal | null
}

export type Tema = 'claro' | 'escuro' | 'sistema'

export type FiltroItens = 'todos' | 'pendentes' | 'concluidos'

export const SCHEMA_VERSION = 2

export const CHAVE_SYNC_GLOBAL = 'global'
