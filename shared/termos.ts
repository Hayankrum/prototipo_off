import { z } from 'zod'

/** Versão vigente do termo. Cliente e servidor precisam bater. */
export const TERMOS_VERSAO = '1.0'

export const termosStatusSchema = z.object({
  versaoAtual: z.string().min(1),
  precisaAceitar: z.boolean(),
  aceite: z
    .object({
      versao: z.string(),
      em: z.number(),
    })
    .nullable(),
})

export type TermosStatus = z.infer<typeof termosStatusSchema>

export const aceitarTermosSchema = z.object({
  versao: z.string().min(1),
})
