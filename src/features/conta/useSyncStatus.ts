import { useSyncExternalStore } from 'react'
import { assinarStatus, obterStatus, type StatusSync } from '../../sync/syncEngine'

export function useSyncStatus(): StatusSync {
  return useSyncExternalStore(assinarStatus, obterStatus, obterStatus)
}
