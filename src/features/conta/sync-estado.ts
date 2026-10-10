import { AlertTriangle, Cloud, CloudOff, RefreshCw, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FaseSync } from '../../sync/syncEngine'

export type TomFase = 'neutro' | 'positivo' | 'atencao' | 'erro'

export interface DescricaoFase {
  rotulo: string
  texto: string
  tom: TomFase
  girando: boolean
}

export const DESCRICOES_FASE: Record<FaseSync, DescricaoFase> = {
  parado: {
    rotulo: 'Sincronização parada',
    texto: 'A sincronização ainda não começou.',
    tom: 'neutro',
    girando: false,
  },
  ocioso: {
    rotulo: 'Sincronizado',
    texto: 'Tudo em dia com a nuvem.',
    tom: 'positivo',
    girando: false,
  },
  sincronizando: {
    rotulo: 'Sincronizando',
    texto: 'Enviando e recebendo alterações…',
    tom: 'neutro',
    girando: true,
  },
  'sem-sessao': {
    rotulo: 'Sem conta conectada',
    texto: 'Entre com uma conta para sincronizar seus itens.',
    tom: 'atencao',
    girando: false,
  },
  'sem-conexao': {
    rotulo: 'Sem conexão',
    texto: 'Sem rede agora. O app segue offline e tenta de novo sozinho.',
    tom: 'atencao',
    girando: false,
  },
  erro: {
    rotulo: 'Erro de sincronização',
    texto: 'Não foi possível sincronizar.',
    tom: 'erro',
    girando: false,
  },
}

export function iconeDaFase(fase: FaseSync): LucideIcon {
  switch (fase) {
    case 'sincronizando':
      return RefreshCw
    case 'sem-conexao':
      return CloudOff
    case 'erro':
      return AlertTriangle
    case 'sem-sessao':
      return UserRound
    default:
      return Cloud
  }
}
