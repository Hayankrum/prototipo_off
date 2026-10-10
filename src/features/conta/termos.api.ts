import { ErroApi, fetchComTimeout } from '../../sync/api'
import { TERMOS_VERSAO, termosStatusSchema, type TermosStatus } from '@shared/termos'

async function erroDe(resposta: Response): Promise<ErroApi> {
  const corpo: unknown = await resposta.json().catch(() => null)
  const mensagem =
    typeof corpo === 'object' && corpo !== null && 'erro' in corpo
      ? String((corpo as { erro: unknown }).erro)
      : `HTTP ${resposta.status}`
  return new ErroApi(resposta.status, mensagem)
}

/** `null` quando não há sessão no servidor. */
export async function statusTermos(): Promise<TermosStatus | null> {
  const resposta = await fetchComTimeout('/api/termos/status')
  if (resposta.status === 401) return null
  if (!resposta.ok) throw await erroDe(resposta)
  const bruto: unknown = await resposta.json().catch(() => null)
  const parse = termosStatusSchema.safeParse(bruto)
  if (!parse.success) throw new ErroApi(resposta.status, 'Resposta de termos inválida')
  return parse.data
}

export async function aceitarTermos(versao: string = TERMOS_VERSAO): Promise<TermosStatus> {
  const resposta = await fetchComTimeout('/api/termos/aceitar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versao }),
  })
  if (!resposta.ok) throw await erroDe(resposta)
  const bruto: unknown = await resposta.json().catch(() => null)
  const parse = termosStatusSchema.safeParse(bruto)
  if (!parse.success) throw new ErroApi(resposta.status, 'Resposta de termos inválida')
  return parse.data
}
