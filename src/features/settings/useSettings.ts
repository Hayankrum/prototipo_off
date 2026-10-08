import { useCallback, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CHAVES, definir, listar } from '../../db/config.repo'
import type { EntradaConfig, Tema } from '../../db/schema'

const TEMAS_CONHECIDOS: string[] = ['claro', 'escuro', 'sistema']

function ehTema(valor: unknown): valor is Tema {
  return typeof valor === 'string' && TEMAS_CONHECIDOS.includes(valor)
}

export interface Configuracoes {
  tema: Tema
  ultimoBackupEm: number | null
  carregado: boolean
  definirTema: (novoTema: Tema) => Promise<void>
}

export function useSettings(): Configuracoes {
  const entradas = useLiveQuery(() => listar(), [])

  const mapa = useMemo(() => {
    const acumulado = new Map<string, EntradaConfig['valor']>()
    for (const entrada of entradas ?? []) {
      acumulado.set(entrada.chave, entrada.valor)
    }
    return acumulado
  }, [entradas])

  const valorTema = mapa.get(CHAVES.tema)
  const tema: Tema = ehTema(valorTema) ? valorTema : 'sistema'

  const valorBackup = mapa.get(CHAVES.ultimoBackupEm)
  const ultimoBackupEm = typeof valorBackup === 'number' ? valorBackup : null

  const definirTema = useCallback((novoTema: Tema) => definir(CHAVES.tema, novoTema), [])

  return { tema, ultimoBackupEm, carregado: entradas !== undefined, definirTema }
}
