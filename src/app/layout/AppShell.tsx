import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { InstallBanner } from '../../features/pwa/InstallBanner'
import { IOSInstallModal } from '../../features/pwa/IOSInstallModal'
import { UpdateToast } from '../../features/pwa/UpdateToast'
import { AvisoTermos } from '../../features/termos/AvisoTermos'
import { soltarCampoFocado } from '../../shared/lib/dom'
import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'
import './shell.css'

export function AppShell() {
  const local = useLocation()

  // Troca de rota: se um campo perdeu o foco sem desmontar direito, o teclado
  // / barra de autocompletar do celular continua na tela. Força a saída.
  useEffect(() => {
    soltarCampoFocado()
  }, [local.pathname])

  return (
    <div className="shell">
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <TopNav />

      <main className="shell-conteudo" id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>

      <BottomNav />
      <InstallBanner />
      <IOSInstallModal />
      <UpdateToast />
      <AvisoTermos />
    </div>
  )
}
