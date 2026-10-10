import { z } from 'zod'
import { itemSchema } from './item'

export const operacaoOutboxSchema = z.enum(['upsert', 'delete'])

export type OperacaoOutbox = z.infer<typeof operacaoOutboxSchema>

export const mutacaoSchema = z.object({
  id: z.string().min(1),
  tabela: z.string().min(1),
  registroId: z.string().min(1),
  operacao: operacaoOutboxSchema,
  payload: itemSchema,
})

export type Mutacao = z.infer<typeof mutacaoSchema>
