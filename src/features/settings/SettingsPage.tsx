import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Download,
  FileDown,
  FileUp,
  HardDrive,
  Monitor,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog'
import { Modal } from '../../shared/ui/Modal'
import { useToast } from '../../shared/ui/Toast'
import type { Tema } from '../../db/schema'
import {
  apagarTudo,
  exportar,
  importar,
  lerInfoBackup,
  type ArquivoBackup,
  type ModoImportacao,
} from '../../shared/lib/backup'
import { formatarBytes, formatarDataHora } from '../../shared/lib/date'
import { pluralizar } from '../../shared/lib/texto'
import {
  estimarArmazenamento,
  solicitarPersistencia,
  type InfoArmazenamento,
} from '../../shared/lib/storage'
import { useInstallPrompt } from '../pwa/useInstallPrompt'
import { usePodeEditar } from '../conta/usePodeEditar'
import { useSettings } from './useSettings'
import './settings.css'

interface OpcaoTema {
  valor: Tema
  rotulo: string
  icone: LucideIcon
}

const OPCOES_TEMA: OpcaoTema[] = [
  { valor: 'claro', rotulo: 'Claro', icone: Sun },
  { valor: 'escuro', rotulo: 'Escuro', icone: Moon },
  { valor: 'sistema', rotulo: 'Sistema', icone: Monitor },
]

const DESCRICOES_TEMA: Record<Tema, string> = {
  claro: 'Tema claro ativo',
  escuro: 'Tema escuro ativo',
  sistema: 'Segue o tema do sistema',
}

export function SettingsPage() {
  const { mostrar } = useToast()
  const { tema, ultimoBackupEm, definirTema } = useSettings()
  const { disponivel, isIOS, isInstalled, install } = useInstallPrompt()
  const podeEditar = usePodeEditar()

  const arquivoRef = useRef<HTMLInputElement>(null)
  const [backupLido, setBackupLido] = useState<{ arquivo: File; backup: ArquivoBackup } | null>(null)
  const [etapaLimpar, setEtapaLimpar] = useState<0 | 1 | 2>(0)
  const [armazenamento, setArmazenamento] = useState<InfoArmazenamento | null>(null)

  const carregarArmazenamento = useCallback(async () => {
    setArmazenamento(await estimarArmazenamento())
  }, [])

  useEffect(() => {
    void carregarArmazenamento()
  }, [carregarArmazenamento])

  async function exportarDados() {
    try {
      const total = await exportar()
      mostrar(`${pluralizar(total, 'item exportado', 'itens exportados')} para o arquivo JSON`, {
        tipo: 'sucesso',
      })
      await carregarArmazenamento()
    } catch {
      mostrar('Não foi possível exportar os dados', { tipo: 'erro' })
    }
  }

  async function aoEscolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo || !podeEditar) return
    const resultado = await lerInfoBackup(arquivo)
    if (!resultado.ok) {
      mostrar(resultado.erro, { tipo: 'erro', duracao: 6000 })
      return
    }
    setBackupLido({ arquivo, backup: resultado.backup })
  }

  async function importarBackup(modo: ModoImportacao) {
    if (!backupLido || !podeEditar) return
    const resultado = await importar(backupLido.arquivo, modo)
    if (!resultado.ok) {
      mostrar(resultado.erro, { tipo: 'erro', duracao: 6000 })
      return
    }
    setBackupLido(null)
    mostrar(
      `${pluralizar(resultado.total, 'item importado', 'itens importados')} (${
        modo === 'substituir' ? 'substituição' : 'mesclagem'
      })`,
      {
        tipo: 'sucesso',
        duracao: 6000,
      },
    )
  }

  async function apagarDados() {
    if (!podeEditar) return
    try {
      await apagarTudo()
      setEtapaLimpar(0)
      mostrar('Todos os dados deste app foram apagados', { tipo: 'info' })
      await carregarArmazenamento()
    } catch {
      mostrar('Não foi possível apagar os dados', { tipo: 'erro' })
    }
  }

  async function solicitarEspaco() {
    const concedido = await solicitarPersistencia()
    mostrar(
      concedido
        ? 'Espaço permanente garantido para o app'
        : 'O navegador não concedeu espaço permanente',
      { tipo: concedido ? 'sucesso' : 'info' },
    )
    await carregarArmazenamento()
  }

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1 className="pagina-titulo">Configurações</h1>
          <p className="pagina-subtitulo">
            Ajustes e dados ficam neste dispositivo; itens são gerenciados com a conta conectada.
          </p>
        </div>
      </div>

      <section className="cartao" aria-labelledby="titulo-tema">
        <h2 className="cartao-titulo" id="titulo-tema">
          Aparência
        </h2>
        <div className="ajustes-linha">
          <div className="ajustes-info">
            <p className="ajustes-rotulo">Tema</p>
            <p className="ajustes-descricao">{DESCRICOES_TEMA[tema]}</p>
          </div>
          <div className="tema-opcoes" role="radiogroup" aria-label="Tema">
            {OPCOES_TEMA.map(({ valor, rotulo, icone: Icone }) => (
              <label
                key={valor}
                className={`tema-opcao${tema === valor ? ' tema-opcao--ativo' : ''}`}
                title={rotulo}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="tema"
                  value={valor}
                  checked={tema === valor}
                  onChange={() => void definirTema(valor)}
                />
                <Icone size={18} aria-hidden="true" />
                <span className="sr-only">{rotulo}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="cartao" aria-labelledby="titulo-instalar">
        <h2 className="cartao-titulo" id="titulo-instalar">
          Aplicativo
        </h2>
        <div className="ajustes-linha">
          <div className="ajustes-info">
            <p className="ajustes-rotulo">Instalar PWA</p>
            <p className="ajustes-descricao">
              {isInstalled
                ? 'App instalado e abrindo como aplicativo.'
                : isIOS
                  ? 'No iPhone ou iPad, adicione pela tela de início usando o Safari.'
                  : 'Adicione à tela inicial para acesso rápido, mesmo offline.'}
            </p>
          </div>
          {isInstalled ? (
            <span className="instalado-status">
              <span className="instalado-ponto" aria-hidden="true" />
              App instalado
            </span>
          ) : disponivel ? (
            <Button
              variante="primario"
              tamanho="pequeno"
              onClick={() => void install()}
            >
              <Download size={16} aria-hidden="true" />
              Instalar
            </Button>
          ) : (
            <span className="instalado-status">
              Use o menu do navegador → Instalar app
            </span>
          )}
        </div>
      </section>

      <section className="cartao" aria-labelledby="titulo-dados">
        <h2 className="cartao-titulo" id="titulo-dados">
          Backup dos dados
        </h2>
        <div className="ajustes-linha">
          <div className="ajustes-info">
            <p className="ajustes-rotulo">Exportar e importar</p>
            <p className="ajustes-descricao">
              {podeEditar
                ? ultimoBackupEm === null
                  ? 'Nenhum backup exportado ainda.'
                  : `Último backup em ${formatarDataHora(ultimoBackupEm)}.`
                : 'Exportar está livre; importar exige a conta conectada.'}
            </p>
          </div>
          <div className="ajustes-acoes">
            <Button
              variante="secundario"
              tamanho="icone"
              aria-label="Exportar JSON"
              title="Exportar JSON"
              onClick={() => void exportarDados()}
            >
              <FileDown size={18} aria-hidden="true" />
            </Button>
            <Button
              variante="secundario"
              tamanho="icone"
              aria-label="Importar JSON"
              title={podeEditar ? 'Importar JSON' : 'Importar JSON (disponível com conta conectada)'}
              disabled={!podeEditar}
              onClick={() => arquivoRef.current?.click()}
            >
              <FileUp size={18} aria-hidden="true" />
            </Button>
            <input
              ref={arquivoRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Selecionar arquivo de backup JSON"
              disabled={!podeEditar}
              onChange={(evento) => void aoEscolherArquivo(evento)}
            />
          </div>
        </div>
      </section>

      <section className="cartao" aria-labelledby="titulo-armazenamento">
        <h2 className="cartao-titulo" id="titulo-armazenamento">
          Armazenamento
        </h2>
        {armazenamento === null ? (
          <p className="pagina-subtitulo">Calculando uso do armazenamento…</p>
        ) : (
          <>
            <div
              className="barra"
              role="progressbar"
              aria-label="Uso do armazenamento do navegador"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(armazenamento.percentual)}
            >
              <div
                className="barra-preenchimento"
                style={{ width: `${Math.max(2, armazenamento.percentual)}%` }}
              />
            </div>
            <p className="pagina-subtitulo armazenamento-linha">
              <HardDrive size={14} aria-hidden="true" /> {formatarBytes(armazenamento.uso)} de{' '}
              {formatarBytes(armazenamento.quota)} usados
            </p>
            <p className="pagina-subtitulo">
              Espaço permanente:{' '}
              <strong>{armazenamento.persistente ? 'garantido' : 'não garantido'}</strong>
            </p>
            <div className="ajustes-acoes">
              <Button
                variante="secundario"
                tamanho="icone"
                aria-label="Recalcular armazenamento"
                title="Recalcular"
                onClick={() => void carregarArmazenamento()}
              >
                <RefreshCw size={18} aria-hidden="true" />
              </Button>
              {!armazenamento.persistente ? (
                <Button
                  variante="secundario"
                  tamanho="icone"
                  aria-label="Solicitar espaço permanente"
                  title="Solicitar espaço permanente"
                  onClick={() => void solicitarEspaco()}
                >
                  <ShieldCheck size={18} aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </>
        )}
      </section>

      <section className="cartao cartao--perigo" aria-labelledby="titulo-apagar">
        <h2 className="cartao-titulo" id="titulo-apagar">
          Conta e dados
        </h2>
        <div className="ajustes-linha">
          <div className="ajustes-info">
            <p className="ajustes-rotulo">Termos de uso e privacidade</p>
            <p className="ajustes-descricao">
              Documento aceito no cadastro. Versão vigente aplicada à sua conta.
            </p>
          </div>
          <Link className="ajustes-link" to="/termos">
            Ler os termos
          </Link>
        </div>
        <div className="ajustes-linha">
          <div className="ajustes-info">
            <p className="ajustes-rotulo">Apagar todos os dados</p>
            <p className="ajustes-descricao">
              {podeEditar
                ? 'Remove itens e ajustes salvos neste app. Exporte um backup antes.'
                : 'Disponível com a conta conectada.'}
            </p>
          </div>
          <Button
            variante="perigo"
            tamanho="pequeno"
            disabled={!podeEditar}
            onClick={() => setEtapaLimpar(1)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Apagar tudo
          </Button>
        </div>
      </section>

      <Modal
        aberto={backupLido !== null}
        titulo="Importar backup"
        onFechar={() => setBackupLido(null)}
        largura="estreito"
        rodape={
          <>
            <Button variante="secundario" onClick={() => setBackupLido(null)}>
              Cancelar
            </Button>
            <Button variante="secundario" onClick={() => void importarBackup('mesclar')}>
              Mesclar
            </Button>
            <Button variante="perigo" onClick={() => void importarBackup('substituir')}>
              Substituir tudo
            </Button>
          </>
        }
      >
        {backupLido ? (
          <>
            <p className="modal-texto">
              Arquivo com{' '}
              <strong>{pluralizar(backupLido.backup.dados.itens.length, 'item', 'itens')}</strong>,
              exportado
              em {formatarDataHora(Date.parse(backupLido.backup.exportadoEm))}.
            </p>
            <p className="modal-texto">
              <strong>Mesclar</strong> mantém o que já existe e só adiciona/atualiza.{' '}
              <strong>Substituir</strong> apaga tudo que está no app agora.
            </p>
          </>
        ) : null}
      </Modal>

      <ConfirmDialog
        aberto={etapaLimpar === 1}
        titulo="Apagar todos os dados?"
        mensagem="Itens e ajustes serão removidos deste dispositivo."
        textoConfirmar="Continuar"
        perigo
        aoConfirmar={() => setEtapaLimpar(2)}
        aoCancelar={() => setEtapaLimpar(0)}
      />

      <ConfirmDialog
        aberto={etapaLimpar === 2}
        titulo="Tem certeza?"
        mensagem="Última confirmação: não será possível desfazer. Recomendamos exportar o backup antes."
        textoConfirmar="Apagar tudo"
        perigo
        aoConfirmar={() => void apagarDados()}
        aoCancelar={() => setEtapaLimpar(0)}
      />
    </div>
  )
}
