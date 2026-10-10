import { Outlet } from 'react-router-dom'
import { InstallBanner } from '../../features/pwa/InstallBanner'
import { IOSInstallModal } from '../../features/pwa/IOSInstallModal'
import { UpdateToast } from '../../features/pwa/UpdateToast'
import { AvisoTermos } from '../../features/termos/AvisoTermos'
import { BottomNav } from './BottomNav'
import { TopNav } from './TopNav'
import './shell.css'

export function AppShell() {
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
