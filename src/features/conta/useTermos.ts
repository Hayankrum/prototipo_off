import { useCallback, useEffect, useState } from 'react'
import type { TermosStatus } from '@shared/termos'
import { aceitarTermos, statusTermos } from './termos.api'
import { useSessao } from './useSessao'

export type EstadoTermos = 'carregando' | 'sem-sessao' | 'pendente' | 'aceito' | 'erro'

export interface SituacaoTermos {
  estado: EstadoTermos
  status: TermosStatus | null
  erro: string | null
  aceitar: () => Promise<boolean>
  recarregar: () => void
}

export function useTermos(): SituacaoTermos {
  const sessao = useSessao()
  const usuarioId = sessao?.usuarioId ?? null

  const [estado, setEstado] = useState<EstadoTermos>('carregando')
  const [status, setStatus] = useState<TermosStatus | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    if (usuarioId === null) {
      setStatus(null)
      setErro(null)
      setEstado('sem-sessao')
      return
    }
    try {
      const resposta = await statusTermos()
      if (resposta === null) {
        setStatus(null)
        setErro(null)
        setEstado('sem-sessao')
        return
      }
      setStatus(resposta)
      setErro(null)
      setEstado(resposta.precisaAceitar ? 'pendente' : 'aceito')
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
      setEstado('erro')
    }
  }, [usuarioId])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const aceitar = useCallback(async (): Promise<boolean> => {
    try {
      const resposta = await aceitarTermos()
      setStatus(resposta)
      setErro(null)
      setEstado(resposta.precisaAceitar ? 'pendente' : 'aceito')
      return !resposta.precisaAceitar
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e))
      setEstado('erro')
      return false
    }
  }, [])

  return { estado, status, erro, aceitar, recarregar: () => void carregar() }
}
