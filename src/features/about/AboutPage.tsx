import { CloudOff, Database, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import appConfig from '../../app/app.config.json'
import './about.css'

export function AboutPage() {
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1 className="pagina-titulo">Sobre</h1>
          <p className="pagina-subtitulo">Informações deste aplicativo.</p>
        </div>
      </div>

      <section className="cartao">
        <h2 className="cartao-titulo">{appConfig.name}</h2>
        <dl className="sobre-lista">
          <div className="sobre-item">
            <dt>Versão</dt>
            <dd>{__APP_VERSION__}</dd>
          </div>
          <div className="sobre-item">
            <dt>Descrição</dt>
            <dd>{appConfig.description}</dd>
          </div>
          <div className="sobre-item">
            <dt>Idioma</dt>
            <dd>Português (Brasil)</dd>
          </div>
        </dl>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo sobre-titulo-icone">
          <CloudOff size={18} aria-hidden="true" />
          100% offline
        </h2>
        <p className="sobre-texto">
          A internet é usada uma única vez, para baixar o app. Depois da primeira abertura, tudo
          funciona sem rede: código, telas e dados ficam no seu dispositivo. Não existem chamadas a
          servidores nem análises de uso.
        </p>
      </section>

      <section className="cartao">
        <h2 className="cartao-titulo sobre-titulo-icone">
          <Database size={18} aria-hidden="true" />
          Onde ficam os dados
        </h2>
        <p className="sobre-texto">
          Seus itens ficam no banco <strong>IndexedDB</strong> deste navegador, neste dispositivo.
          Nada é enviado para a nuvem. Se você apagar os dados do navegador ou desinstalar o app, os
          itens vão junto — por isso exporte um backup de vez em quando.
        </p>
        <Link className="sobre-link" to="/config">
          Ir para Ajustes
          <ExternalLink size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
