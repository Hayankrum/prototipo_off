import { useEffect, type PropsWithChildren } from 'react'
import appConfig from '../../app/app.config.json'
import type { Tema } from '../../db/schema'
import { useSettings } from '../settings/useSettings'

export const CHAVE_TEMA_LOCAL = 'meu-app:tema'

function estaEscuro(tema: Tema): boolean {
  if (tema === 'escuro') return true
  if (tema === 'claro') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement
  raiz.setAttribute('data-theme', tema)

  const escuro = estaEscuro(tema)
  raiz.style.colorScheme = escuro ? 'dark' : 'light'

  try {
    localStorage.setItem(CHAVE_TEMA_LOCAL, tema)
  } catch {
    // armazenamento indisponível: o atributo continua valendo
  }

  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  meta?.setAttribute('content', escuro ? appConfig.metaThemeColorEscuro : appConfig.metaThemeColorClaro)
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const { tema, carregado } = useSettings()

  useEffect(() => {
    if (carregado) aplicarTema(tema)
  }, [carregado, tema])

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const aoMudar = () => {
      if (carregado) aplicarTema(tema)
    }
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [carregado, tema])

  return <>{children}</>
}
