import { Hono } from 'hono'
import { aceitarTermosSchema, TERMOS_VERSAO, type TermosStatus } from '@shared/termos'
import { prisma } from './prisma'
import { exigirSessao } from './session'

async function statusDoUsuario(userId: string): Promise<TermosStatus> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { aceiteTermosEm: true, aceiteTermosVersao: true },
  })
  const em = usuario?.aceiteTermosEm ?? null
  const versao = usuario?.aceiteTermosVersao ?? null
  const aceite = em !== null && versao !== null ? { versao, em: em.getTime() } : null
  return {
    versaoAtual: TERMOS_VERSAO,
    precisaAceitar: aceite === null || aceite.versao !== TERMOS_VERSAO,
    aceite,
  }
}

/** Sincronização só roda com o termo vigente aceito (prova de consentimento). */
export async function exigirTermosAceitos(userId: string): Promise<boolean> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { aceiteTermosVersao: true },
  })
  return usuario?.aceiteTermosVersao === TERMOS_VERSAO
}

export const termosRoutes = new Hono()

termosRoutes.get('/termos/status', async (c) => {
  const sessao = await exigirSessao(c)
  if (!sessao) return c.json({ erro: 'Não autenticado', code: 'UNAUTHORIZED' }, 401)
  return c.json(await statusDoUsuario(sessao.userId))
})

termosRoutes.post('/termos/aceitar', async (c) => {
  const sessao = await exigirSessao(c)
  if (!sessao) return c.json({ erro: 'Não autenticado', code: 'UNAUTHORIZED' }, 401)

  const bruto: unknown = await c.req.json().catch(() => null)
  const parse = aceitarTermosSchema.safeParse(bruto)
  if (!parse.success) {
    return c.json({ erro: 'Payload inválido', code: 'INVALID_PAYLOAD' }, 400)
  }
  if (parse.data.versao !== TERMOS_VERSAO) {
    return c.json({ erro: 'Versão do termo inválida', code: 'VERSAO_INVALIDA' }, 400)
  }

  await prisma.user.update({
    where: { id: sessao.userId },
    data: { aceiteTermosEm: new Date(), aceiteTermosVersao: TERMOS_VERSAO },
  })
  return c.json(await statusDoUsuario(sessao.userId))
})
