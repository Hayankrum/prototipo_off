import { z } from 'zod'

export const itemSchema = z.object({
  id: z.string().min(1),
  titulo: z.string(),
  descricao: z.string(),
  concluido: z.boolean(),
  criadoEm: z.number(),
  updatedAt: z.number(),
  deletedAt: z.number().optional(),
  serverVersion: z.number().int().positive().optional(),
})

export type Item = z.infer<typeof itemSchema>
