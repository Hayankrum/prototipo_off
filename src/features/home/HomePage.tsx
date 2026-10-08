import { Link } from 'react-router-dom'
import { AlertTriangle, CircleCheck, CircleDashed, ListTodo } from 'lucide-react'
import appConfig from '../../app/app.config.json'
import { useItemsStats } from '../items/useItems'
import { useSettings } from '../settings/useSettings'
import { diasDesde } from '../../shared/lib/date'
import './home.css'

export function HomePage() {
  const { total, concluidos, pendentes } = useItemsStats()
  const { ultimoBackupEm } = useSettings()

  const diasSemBackup = ultimoBackupEm === null ? null : diasDesde(ultimoBackupEm)
  const avisoBackup = diasSemBackup === null || diasSemBackup > 30

  return (
    <div className="pagina">
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero-marca" aria-hidden="true">
          <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" />
        </div>

        <div className="hero-conteudo">
          <h1 className="hero-titulo" id="hero-titulo">
            <span className="hero-titulo-linha">Bem-vindo</span>
            <span className="hero-titulo-nome">{appConfig.name}</span>
          </h1>

          <p className="hero-texto">
            Um app de itens que funciona <strong>100% offline</strong>. Tudo fica salvo apenas
            neste dispositivo, sem contas e sem servidor.
          </p>
        </div>
      </section>

      <section className="resumo-grade" aria-label="Resumo dos itens">
        <div className="cartao resumo-cartao">
          <span className="resumo-icone" aria-hidden="true">
            <ListTodo size={18} />
          </span>
          <p className="resumo-valor">{total}</p>
          <p className="resumo-rotulo">Total</p>
        </div>
        <div className="cartao resumo-cartao">
          <span className="resumo-icone resumo-icone--pendente" aria-hidden="true">
            <CircleDashed size={18} />
          </span>
          <p className="resumo-valor">{pendentes}</p>
          <p className="resumo-rotulo">Pendentes</p>
        </div>
        <div className="cartao resumo-cartao">
          <span className="resumo-icone resumo-icone--concluido" aria-hidden="true">
            <CircleCheck size={18} />
          </span>
          <p className="resumo-valor">{concluidos}</p>
          <p className="resumo-rotulo">Concluídos</p>
        </div>
      </section>

      {avisoBackup ? (
        <div className="aviso aviso--compacto" role="status">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>
            {diasSemBackup === null
              ? 'Você ainda não exportou seus dados. Faça um backup em '
              : `Faz ${diasSemBackup} dias desde seu último backup. Faça outro em `}
            <Link to="/config">Ajustes</Link>.
          </span>
        </div>
      ) : null}
    </div>
  )
}
