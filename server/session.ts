import type { Context } from 'hono'
import { auth } from './auth'

export interface SessaoInfo {
  userId: string
  email: string
}

export async function exigirSessao(c: Context): Promise<SessaoInfo | null> {
  const sessao = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!sessao) return null
  return { userId: sessao.user.id, email: sessao.user.email }
}
