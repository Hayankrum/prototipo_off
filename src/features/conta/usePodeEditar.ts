import { useSessao } from './useSessao'

/**
 * Manipulação de itens (criar/editar/excluir/importar) só com conta conectada.
 * O espelho da sessão vive no IndexedDB, então segue valendo offline.
 */
export function usePodeEditar(): boolean {
  return useSessao() !== null
}
