import { z } from 'zod'

export const usuarioSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  nome: z.string().nullable().optional(),
})

export type Usuario = z.infer<typeof usuarioSchema>

export const sessaoLocalSchema = z.object({
  usuarioId: z.string().min(1),
  email: z.string().min(1),
  nome: z.string().nullable(),
  expiraEm: z.number().nullable(),
})

export type SessaoLocal = z.infer<typeof sessaoLocalSchema>

export const sessaoRespostaSchema = z.object({
  usuario: usuarioSchema,
  expiraEm: z.number(),
})

export type SessaoResposta = z.infer<typeof sessaoRespostaSchema>
