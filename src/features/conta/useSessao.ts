import { useLiveQuery } from 'dexie-react-hooks'
import * as syncState from '../../db/sync-state.repo'
import { CHAVE_SYNC_GLOBAL, type EstadoSync, type SessaoLocal } from '../../db/schema'

const ESTADO_PADRAO: EstadoSync = {
  chave: CHAVE_SYNC_GLOBAL,
  cursor: '0',
  ultimaSincronizacao: null,
  sessao: null,
}

export function useSessao(): SessaoLocal | null {
  const estado = useLiveQuery(() => syncState.obter(), [], ESTADO_PADRAO)
  return estado.sessao
}

export function useEstadoSync(): EstadoSync {
  return useLiveQuery(() => syncState.obter(), [], ESTADO_PADRAO)
}
