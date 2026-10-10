import { Hono } from 'hono'
import {
  pullQuerySchema,
  pushRequestSchema,
  TABELA_ITEMS,
  type ResultadoMutacao,
} from '@shared/schemas/sync'
import type { Item } from '@shared/schemas/item'
import { prisma } from './prisma'
import { exigirSessao } from './session'

const JANELA_MS = 5 * 60 * 1000

type ItemTabela = {
  id: string
  userId: string
  titulo: string
  descricao: string
  concluido: boolean
  criadoEm: bigint
  updatedAt: bigint
  deletedAt: bigint | null
  serverSeq: bigint
}

function toWire(item: ItemTabela): Item {
  const base = {
    id: item.id,
    titulo: item.titulo,
    descricao: item.descricao,
    concluido: item.concluido,
    criadoEm: Number(item.criadoEm),
    updatedAt: Number(item.updatedAt),
    serverVersion: Number(item.serverSeq),
  }
  return item.deletedAt === null ? base : { ...base, deletedAt: Number(item.deletedAt) }
}

async function processarLote(
  userId: string,
  mutacoes: PushLote,
  resultados: ResultadoMutacao[],
): Promise<void> {
  const agoraMs = Date.now()
  const limiteTs = agoraMs + JANELA_MS

  await prisma.$transaction(async (tx) => {
    for (const mut of mutacoes) {
      if (mut.tabela !== TABELA_ITEMS) {
        resultados.push({ mutacaoId: mut.id, status: 'invalida' })
        continue
      }

      const jaVista = await tx.syncMutation.findUnique({ where: { id: mut.id } })
      if (jaVista) {
        const atual = await tx.item.findUnique({ where: { id: mut.registroId } })
        if (atual && atual.userId === userId) {
          resultados.push({
            mutacaoId: mut.id,
            status: 'aplicada',
            serverVersion: Number(atual.serverSeq),
            registro: toWire(atual),
          })
        } else {
          resultados.push({ mutacaoId: mut.id, status: 'aplicada' })
        }
        continue
      }

      const existente = await tx.item.findUnique({ where: { id: mut.registroId } })
      if (existente && existente.userId !== userId) {
        resultados.push({ mutacaoId: mut.id, status: 'invalida' })
        continue
      }

      const updatedAt = Math.min(mut.payload.updatedAt, limiteTs)
      let deletedAt = mut.payload.deletedAt
      if (deletedAt !== undefined && deletedAt > updatedAt) deletedAt = updatedAt

      if (existente && existente.updatedAt > BigInt(updatedAt)) {
        await tx.syncMutation.create({
          data: { id: mut.id, userId, appliedAt: BigInt(agoraMs) },
        })
        resultados.push({
          mutacaoId: mut.id,
          status: 'ignorada',
          serverVersion: Number(existente.serverSeq),
          registro: toWire(existente),
        })
        continue
      }

      const { seq } = await tx.user.update({
        where: { id: userId },
        data: { seq: { increment: 1 } },
        select: { seq: true },
      })
      const dadosItem = {
        titulo: mut.payload.titulo,
        descricao: mut.payload.descricao,
        concluido: mut.payload.concluido,
        updatedAt: BigInt(updatedAt),
        deletedAt: deletedAt === undefined ? null : BigInt(deletedAt),
        serverSeq: seq,
      }
      const gravado = await tx.item.upsert({
        where: { id: mut.registroId },
        create: {
          id: mut.registroId,
          userId,
          criadoEm: BigInt(mut.payload.criadoEm),
          ...dadosItem,
        },
        update: dadosItem,
      })
      await tx.syncMutation.create({
        data: { id: mut.id, userId, appliedAt: BigInt(agoraMs) },
      })
      resultados.push({
        mutacaoId: mut.id,
        status: 'aplicada',
        serverVersion: Number(seq),
        registro: toWire(gravado),
      })
    }
  })
}

type PushLote = ReturnType<typeof pushRequestSchema.parse>['mutacoes']

function ehConflitoConcorrente(erro: unknown): boolean {
  return (
    typeof erro === 'object' &&
    erro !== null &&
    'code' in erro &&
    (erro as { code?: string }).code === 'P2002'
  )
}

export const syncRoutes = new Hono()

syncRoutes.post('/sync/push', async (c) => {
  const sessao = await exigirSessao(c)
  if (!sessao) return c.json({ erro: 'Não autenticado' }, 401)

  const bruto: unknown = await c.req.json().catch(() => null)
  const parse = pushRequestSchema.safeParse(bruto)
  if (!parse.success) {
    return c.json({ erro: 'Payload inválido', detalhes: parse.error.issues }, 400)
  }

  const resultados: ResultadoMutacao[] = []
  try {
    try {
      await processarLote(sessao.userId, parse.data.mutacoes, resultados)
    } catch (erro) {
      if (!ehConflitoConcorrente(erro)) throw erro
      // Mutação simultânea em outra requisição: reprocessa (o id já visto vira replay).
      resultados.length = 0
      await processarLote(sessao.userId, parse.data.mutacoes, resultados)
    }
  } catch (erro) {
    console.error('push falhou', erro)
    return c.json({ erro: 'Falha ao processar o lote' }, 500)
  }

  const usuario = await prisma.user.findUnique({
    where: { id: sessao.userId },
    select: { seq: true },
  })
  return c.json({ resultados, proximoCursor: String(usuario?.seq ?? 0n) })
})

syncRoutes.get('/sync/pull', async (c) => {
  const sessao = await exigirSessao(c)
  if (!sessao) return c.json({ erro: 'Não autenticado' }, 401)

  const parse = pullQuerySchema.safeParse({
    cursor: c.req.query('cursor'),
    limit: c.req.query('limit'),
  })
  if (!parse.success) {
    return c.json({ erro: 'Query inválida', detalhes: parse.error.issues }, 400)
  }
  const { cursor, limit } = parse.data

  const linhas = await prisma.item.findMany({
    where: { userId: sessao.userId, serverSeq: { gt: BigInt(cursor) } },
    orderBy: { serverSeq: 'asc' },
    take: limit + 1,
  })
  const temMais = linhas.length > limit
  const pagina = temMais ? linhas.slice(0, limit) : linhas
  const proximoCursor = pagina.length > 0 ? String(pagina[pagina.length - 1].serverSeq) : cursor

  return c.json({ registros: pagina.map(toWire), proximoCursor, temMais })
})
