import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../../shared/ui/Button'
import { useInstallPrompt } from './useInstallPrompt'
import './pwa.css'

const ATRASO_BANNER_MS = 3500

export function InstallBanner() {
  const { canInstall, isIOS, install, dismiss } = useInstallPrompt()
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (!canInstall || isIOS) {
      setVisivel(false)
      return undefined
    }
    const temporizador = window.setTimeout(() => setVisivel(true), ATRASO_BANNER_MS)
    return () => window.clearTimeout(temporizador)
  }, [canInstall, isIOS])

  if (!visivel) return null

  return (
    <section className="install-banner" aria-label="Instalar aplicativo">
      <div className="install-banner-icone" aria-hidden="true">
        <Download size={20} />
      </div>
      <div className="install-banner-texto">
        <strong className="install-banner-titulo">Instalar o app</strong>
        <span className="install-banner-descricao">Abra como aplicativo, mesmo offline.</span>
      </div>
      <div className="install-banner-acoes">
        <Button tamanho="pequeno" onClick={() => void install()}>
          Instalar
        </Button>
        <Button variante="fantasma" tamanho="pequeno" onClick={dismiss}>
          Agora não
        </Button>
      </div>
    </section>
  )
}
