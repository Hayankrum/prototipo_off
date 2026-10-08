import { Link, Outlet } from 'react-router-dom'
import appConfig from '../app.config.json'
import { InstallBanner } from '../../features/pwa/InstallBanner'
import { IOSInstallModal } from '../../features/pwa/IOSInstallModal'
import { UpdateToast } from '../../features/pwa/UpdateToast'
import { BottomNav } from './BottomNav'
import './shell.css'

export function AppShell() {
  return (
    <div className="shell">
      <a className="pular-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <header className="shell-cabecalho">
        <div className="shell-cabecalho-interno">
          <Link to="/" className="shell-marca">
            {appConfig.name}
          </Link>
        </div>
      </header>

      <main className="shell-conteudo" id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>

      <BottomNav />
      <InstallBanner />
      <IOSInstallModal />
      <UpdateToast />
    </div>
  )
}
