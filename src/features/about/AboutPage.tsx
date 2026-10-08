import {
  CloudOff,
  Database,
  Download,
  ExternalLink,
  HardDrive,
  Moon,
  Palette,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import appConfig from '../../app/app.config.json'
import { Button } from '../../shared/ui/Button'
import { useInstallPrompt } from '../pwa/useInstallPrompt'
import { ShareSection } from './ShareSection'
import './about.css'

const FUNCIONALIDADES = [
  { icone: CloudOff, texto: 'Suporte offline completo' },
  { icone: Smartphone, texto: 'PWA instalável na tela inicial' },
  { icone: Palette, texto: 'Tema claro e escuro' },
  { icone: HardDrive, texto: 'Backup em arquivo JSON' },
  { icone: ShieldCheck, texto: 'Sem contas, sem servidores, sem rastreamento' },
  { icone: Database, texto: 'Dados salvos apenas no dispositivo' },
] as const

const TECNOLOGIAS = ['Vite', 'React', 'TypeScript', 'Dexie (IndexedDB)', 'Workbox', 'PWA']

export function AboutPage() {
  const { canInstall, isIOS, install } = useInstallPrompt()

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1 className="pagina-titulo">Sobre o aplicativo</h1>
        </div>
      </div>

      <section className="cartao">
        <h2 className="cartao-titulo">{appConfig.name}</h2>
        <p className="sobre-texto">{appConfig.description}</p>
        <div className="sobre-versao">
          <span className="sobre-versao-ponto" aria-hidden="true" />
          <span className="sobre-versao-rotulo">Versão {__APP_VERSION__}</span>
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Funcionalidades</h2>
        <ul className="sobre-funcionalidades">
          {FUNCIONALIDADES.map(({ icone: Icone, texto }) => (
            <li key={texto}>
              <Icone size={16} aria-hidden="true" />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">100% offline</h2>
        <p className="sobre-texto">
          A internet é usada uma única vez, para baixar o app. Depois da primeira abertura, tudo
          funciona sem rede: código, telas e dados ficam no seu dispositivo. Não existem chamadas a
          servidores nem análises de uso.
        </p>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Onde ficam os dados</h2>
        <p className="sobre-texto">
          Seus itens ficam no banco <strong>IndexedDB</strong> deste navegador, neste dispositivo.
          Nada é enviado para a nuvem. Se você apagar os dados do navegador ou desinstalar o app, os
          itens vão junto — por isso exporte um backup de vez em quando.
        </p>
        <Link className="sobre-link" to="/config">
          Ir para Configurações
          <ExternalLink size={16} aria-hidden="true" />
        </Link>
      </section>

      {canInstall ? (
        <section className="cartao">
          <h2 className="cartao-titulo">Instalar aplicativo</h2>
          <p className="sobre-texto">
            Instale o aplicativo na sua tela inicial para acesso rápido e melhor experiência
            offline.
          </p>
          <Button className="sobre-botao" onClick={() => void install()}>
            <Download size={18} aria-hidden="true" />
            {isIOS ? 'Como instalar no iPhone' : 'Instalar agora'}
          </Button>
        </section>
      ) : null}

      <section className="cartao">
        <h2 className="cartao-titulo">Como instalar</h2>
        <div className="sobre-passos">
          <div>
            <p className="sobre-passo-titulo">Chrome / Edge</p>
            <p className="sobre-passo-texto">
              Clique no ícone de instalar que aparece na barra de endereço do navegador.
            </p>
          </div>
          <div>
            <p className="sobre-passo-titulo">Firefox</p>
            <p className="sobre-passo-texto">Clique nos 3 pontos do menu → &quot;Instalar&quot;.</p>
          </div>
          <div>
            <p className="sobre-passo-titulo">Safari (iOS)</p>
            <p className="sobre-passo-texto">
              Toque no botão &quot;Compartilhar&quot; → &quot;Adicionar à Tela de Início&quot;.
            </p>
          </div>
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo">Tecnologias</h2>
        <div className="sobre-tags">
          {TECNOLOGIAS.map((tech) => (
            <span key={tech} className="sobre-tag">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo sobre-titulo-icone">
          <Moon size={18} aria-hidden="true" />
          Tema claro e escuro
        </h2>
        <p className="sobre-texto">
          A aparência segue o tema escolhido em Configurações e é aplicada antes mesmo do app
          carregar, sem clarão na primeira abertura.
        </p>
      </section>

      <ShareSection />
    </div>
  )
}
