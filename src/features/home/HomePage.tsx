import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CircleCheck, CircleDashed, ListTodo } from 'lucide-react'
import { useItemsStats } from '../items/useItems'
import { useSettings } from '../settings/useSettings'
import { diasDesde, formatarData } from '../../shared/lib/date'
import './home.css'

export function HomePage() {
  const { total, concluidos, pendentes } = useItemsStats()
  const { ultimoBackupEm } = useSettings()

  const diasSemBackup = ultimoBackupEm === null ? null : diasDesde(ultimoBackupEm)
  const avisoBackup = diasSemBackup === null || diasSemBackup > 30

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1 className="pagina-titulo">Início</h1>
          <p className="pagina-subtitulo">Resumo rápido do que está na sua lista.</p>
        </div>
      </div>

      <section className="resumo-grade" aria-label="Resumo dos itens">
        <div className="cartao resumo-cartao">
          <span className="resumo-icone" aria-hidden="true">
            <ListTodo size={20} />
          </span>
          <p className="resumo-valor">{total}</p>
          <p className="resumo-rotulo">Total de itens</p>
        </div>
        <div className="cartao resumo-cartao">
          <span className="resumo-icone resumo-icone--pendente" aria-hidden="true">
            <CircleDashed size={20} />
          </span>
          <p className="resumo-valor">{pendentes}</p>
          <p className="resumo-rotulo">Pendentes</p>
        </div>
        <div className="cartao resumo-cartao">
          <span className="resumo-icone resumo-icone--concluido" aria-hidden="true">
            <CircleCheck size={20} />
          </span>
          <p className="resumo-valor">{concluidos}</p>
          <p className="resumo-rotulo">Concluídos</p>
        </div>
      </section>

      {avisoBackup ? (
        <div className="aviso" role="status">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            {diasSemBackup === null
              ? 'Você ainda não exportou seus dados. Faça um backup em '
              : `Faz ${diasSemBackup} dias desde seu último backup. Faça outro em `}
            <Link to="/config">Ajustes</Link>.
          </span>
        </div>
      ) : null}

      <section className="cartao atalho-cartao" aria-labelledby="atalho-titulo">
        <div className="atalho-texto">
          <h2 className="cartao-titulo" id="atalho-titulo">
            Gerenciar itens
          </h2>
          <p className="pagina-subtitulo">
            {ultimoBackupEm !== null && diasSemBackup !== null && diasSemBackup <= 30
              ? `Último backup em ${formatarData(ultimoBackupEm)}.`
              : 'Crie, edite, conclua e exclua itens.'}
          </p>
        </div>
        <Link className="atalho-link" to="/itens">
          Abrir itens
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
