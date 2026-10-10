import { z } from 'zod'
import {
  pullResponseSchema,
  pushRequestSchema,
  pushResponseSchema,
  type PullResponse,
  type PushResponse,
} from '@shared/schemas/sync'
import type { Mutacao } from '@shared/schemas/outbox'
import type { SessaoLocal } from '@shared/schemas/usuario'

const TIMEOUT_MS = 15_000

export class ErroApi extends Error {
  readonly status: number

  constructor(status: number, mensagem?: string) {
    super(mensagem ?? `HTTP ${status}`)
    this.name = 'ErroApi'
    this.status = status
  }
}

export class ErroRede extends Error {
  constructor(cause?: unknown) {
    super('Falha de rede ao falar com o servidor', { cause })
    this.name = 'ErroRede'
  }
}

async function fetchComTimeout(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      credentials: 'same-origin',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (erro) {
    throw new ErroRede(erro)
  }
}

const sessaoBetterAuthSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().min(1),
    name: z.string().nullable().optional(),
  }),
  session: z.object({ expiresAt: z.string() }),
})

export async function obterSessao(): Promise<SessaoLocal | null> {
  const resp = await fetchComTimeout('/api/auth/get-session')
  if (resp.status === 401) return null
  if (!resp.ok) throw new ErroApi(resp.status)
  const bruto: unknown = await resp.json().catch(() => null)
  const parse = sessaoBetterAuthSchema.safeParse(bruto)
  if (!parse.success) return null
  const expiraEm = Date.parse(parse.data.session.expiresAt)
  return {
    usuarioId: parse.data.user.id,
    email: parse.data.user.email,
    nome: parse.data.user.name ?? null,
    expiraEm: Number.isNaN(expiraEm) ? null : expiraEm,
  }
}

export async function enviarPush(mutacoes: Mutacao[]): Promise<PushResponse> {
  const corpo = pushRequestSchema.parse({ mutacoes })
  const resp = await fetchComTimeout('/api/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  if (!resp.ok) throw new ErroApi(resp.status)
  const bruto: unknown = await resp.json().catch(() => null)
  const parse = pushResponseSchema.safeParse(bruto)
  if (!parse.success) throw new ErroApi(resp.status, 'Resposta de push inválida')
  return parse.data
}

export async function puxar(cursor: string, limite: number): Promise<PullResponse> {
  const resp = await fetchComTimeout(
    `/api/sync/pull?cursor=${encodeURIComponent(cursor)}&limit=${limite}`,
  )
  if (!resp.ok) throw new ErroApi(resp.status)
  const bruto: unknown = await resp.json().catch(() => null)
  const parse = pullResponseSchema.safeParse(bruto)
  if (!parse.success) throw new ErroApi(resp.status, 'Resposta de pull inválida')
  return parse.data
}
