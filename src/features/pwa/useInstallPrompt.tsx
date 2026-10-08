import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

interface EventoInstalacao extends Event {
  readonly platforms: string[]
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface Instalacao {
  canInstall: boolean
  isIOS: boolean
  isInstalled: boolean
  install: () => Promise<void>
  dismiss: () => void
}

interface EstadoInstalacao extends Instalacao {
  modalIOSAberto: boolean
}

const CHAVE_DESCARTE = 'meu-app:instalacao-descartada-em'
const PRAZO_DESCARTE_MS = 14 * 24 * 60 * 60 * 1000
const ATRASO_MODAL_IOS_MS = 2500

const InstalacaoContext = createContext<EstadoInstalacao | null>(null)

function detectarInstalado(): boolean {
  const navegador = navigator as Navigator & { standalone?: boolean }
  if (typeof navegador.standalone === 'boolean') return navegador.standalone
  return window.matchMedia('(display-mode: standalone)').matches
}

function detectarIOS(): boolean {
  const agente = navigator.userAgent ?? ''
  const porAgente = /iPad|iPhone|iPod/.test(agente)
  const ipadModern = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return porAgente || ipadModern
}

function lerDescarte(): number | null {
  try {
    const bruto = localStorage.getItem(CHAVE_DESCARTE)
    if (bruto === null) return null
    const valor = Number(bruto)
    return Number.isFinite(valor) ? valor : null
  } catch {
    return null
  }
}

function useInstalacaoContexto(): EstadoInstalacao {
  const contexto = useContext(InstalacaoContext)
  if (!contexto) {
    throw new Error('O hook de instalação precisa estar dentro de InstallPromptProvider')
  }
  return contexto
}

export function InstallPromptProvider({ children }: PropsWithChildren) {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null)
  const [instalado, setInstalado] = useState(detectarInstalado)
  const [descartadoEm, setDescartadoEm] = useState<number | null>(lerDescarte)
  const [modalIOSAberto, setModalIOSAberto] = useState(false)

  const ios = detectarIOS()
  const descartadoRecentemente =
    descartadoEm !== null && Date.now() - descartadoEm < PRAZO_DESCARTE_MS

  useEffect(() => {
    const aoReceberPrompt = (eventoRecebido: Event) => {
      eventoRecebido.preventDefault()
      setEvento(eventoRecebido as EventoInstalacao)
    }
    const aoInstalar = () => {
      setInstalado(true)
      setEvento(null)
      setModalIOSAberto(false)
    }
    const modo = window.matchMedia('(display-mode: standalone)')
    const aoMudarModo = () => setInstalado(modo.matches)

    window.addEventListener('beforeinstallprompt', aoReceberPrompt)
    window.addEventListener('appinstalled', aoInstalar)
    modo.addEventListener('change', aoMudarModo)
    return () => {
      window.removeEventListener('beforeinstallprompt', aoReceberPrompt)
      window.removeEventListener('appinstalled', aoInstalar)
      modo.removeEventListener('change', aoMudarModo)
    }
  }, [])

  useEffect(() => {
    if (!ios || instalado || descartadoRecentemente) return undefined
    const temporizador = window.setTimeout(() => setModalIOSAberto(true), ATRASO_MODAL_IOS_MS)
    return () => window.clearTimeout(temporizador)
  }, [ios, instalado, descartadoRecentemente])

  const dismiss = useCallback(() => {
    const agora = Date.now()
    try {
      localStorage.setItem(CHAVE_DESCARTE, String(agora))
    } catch {
      // sem armazenamento local o aviso volta na próxima sessão
    }
    setDescartadoEm(agora)
    setModalIOSAberto(false)
  }, [])

  const install = useCallback(async () => {
    if (evento !== null) {
      try {
        await evento.prompt()
        const escolha = await evento.userChoice
        if (escolha.outcome === 'accepted') setEvento(null)
      } catch {
        setEvento(null)
      }
      return
    }
    if (!instalado && ios) setModalIOSAberto(true)
  }, [evento, instalado, ios])

  const valor = useMemo<EstadoInstalacao>(
    () => ({
      canInstall: !instalado && (evento !== null || ios) && !descartadoRecentemente,
      isIOS: ios,
      isInstalled: instalado,
      install,
      dismiss,
      modalIOSAberto,
    }),
    [instalado, evento, ios, descartadoRecentemente, install, dismiss, modalIOSAberto],
  )

  return <InstalacaoContext.Provider value={valor}>{children}</InstalacaoContext.Provider>
}

export function useInstallPrompt(): Instalacao {
  const contexto = useInstalacaoContexto()
  return useMemo(
    () => ({
      canInstall: contexto.canInstall,
      isIOS: contexto.isIOS,
      isInstalled: contexto.isInstalled,
      install: contexto.install,
      dismiss: contexto.dismiss,
    }),
    [contexto],
  )
}

export function useInstallModal(): { aberto: boolean } {
  const contexto = useInstalacaoContexto()
  return { aberto: contexto.modalIOSAberto }
}
