import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast } from '../../shared/ui/Toast'
import './pwa.css'

const CHAVE_AVISO_OFFLINE = 'meu-app:aviso-offline-exibido'

export function UpdateToast() {
  const { mostrar } = useToast()
  const [swPronto, setSwPronto] = useState(false)
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onOfflineReady: () => setSwPronto(true),
  })
  const precisaAtualizar = needRefresh[0]

  useEffect(() => {
    if (!swPronto) return
    try {
      if (localStorage.getItem(CHAVE_AVISO_OFFLINE) === '1') return
      localStorage.setItem(CHAVE_AVISO_OFFLINE, '1')
    } catch {
      // sem localStorage o aviso apenas se repete
    }
    mostrar('Pronto para uso offline', { tipo: 'sucesso' })
  }, [swPronto, mostrar])

  if (!precisaAtualizar) return null

  return (
    <div className="update-toast" role="status">
      <span className="update-toast-texto">Nova versão disponível</span>
      <button
        type="button"
        className="update-toast-botao"
        onClick={() => void updateServiceWorker(true)}
      >
        <RefreshCw size={16} aria-hidden="true" />
        Atualizar
      </button>
    </div>
  )
}
