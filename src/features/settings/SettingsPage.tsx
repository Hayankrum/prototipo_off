import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  Download,
  FileDown,
  FileUp,
  HardDrive,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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

export function SettingsPage() {
  const { mostrar } = useToast()
  const { tema, ultimoBackupEm, definirTema } = useSettings()
  const { canInstall, isIOS, install } = useInstallPrompt()

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
    if (!arquivo) return
    const resultado = await lerInfoBackup(arquivo)
    if (!resultado.ok) {
      mostrar(resultado.erro, { tipo: 'erro', duracao: 6000 })
      return
    }
    setBackupLido({ arquivo, backup: resultado.backup })
  }

  async function importarBackup(modo: ModoImportacao) {
    if (!backupLido) return
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
          <p className="pagina-subtitulo">Tudo é salvo apenas neste dispositivo.</p>
        </div>
      </div>

      <section className="cartao" aria-labelledby="titulo-tema">
        <h2 className="cartao-titulo" id="titulo-tema">
          Aparência
        </h2>
        <fieldset className="tema-campo">
          <legend className="campo-label">Tema</legend>
          <div className="tema-opcoes">
            {OPCOES_TEMA.map(({ valor, rotulo, icone: Icone }) => (
              <label
                key={valor}
                className={`tema-opcao${tema === valor ? ' tema-opcao--ativo' : ''}`}
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
                <span>{rotulo}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {canInstall ? (
        <section className="cartao" aria-labelledby="titulo-instalar">
          <h2 className="cartao-titulo" id="titulo-instalar">
            Instalar app
          </h2>
          <p className="pagina-subtitulo">
            {isIOS
              ? 'No iPhone ou iPad, você adiciona o app pela tela de início usando o Safari.'
              : 'Adicione o app à sua tela de início para abrir como um aplicativo.'}
          </p>
          <Button className="ajustes-botao" onClick={() => void install()}>
            <Download size={18} aria-hidden="true" />
            Instalar agora
          </Button>
        </section>
      ) : null}

      <section className="cartao" aria-labelledby="titulo-dados">
        <h2 className="cartao-titulo" id="titulo-dados">
          Backup dos dados
        </h2>
        <p className="pagina-subtitulo">
          {ultimoBackupEm === null
            ? 'Nenhum backup exportado ainda.'
            : `Último backup em ${formatarDataHora(ultimoBackupEm)}.`}
        </p>
        <div className="ajustes-acoes">
          <Button variante="secundario" onClick={() => void exportarDados()}>
            <FileDown size={18} aria-hidden="true" />
            Exportar JSON
          </Button>
          <Button variante="secundario" onClick={() => arquivoRef.current?.click()}>
            <FileUp size={18} aria-hidden="true" />
            Importar JSON
          </Button>
          <input
            ref={arquivoRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Selecionar arquivo de backup JSON"
            onChange={(evento) => void aoEscolherArquivo(evento)}
          />
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
              <Button variante="secundario" tamanho="pequeno" onClick={() => void carregarArmazenamento()}>
                <RefreshCw size={16} aria-hidden="true" />
                Recalcular
              </Button>
              {!armazenamento.persistente ? (
                <Button variante="secundario" tamanho="pequeno" onClick={() => void solicitarEspaco()}>
                  Solicitar espaço permanente
                </Button>
              ) : null}
            </div>
          </>
        )}
      </section>

      <section className="cartao cartao--perigo" aria-labelledby="titulo-apagar">
        <h2 className="cartao-titulo" id="titulo-apagar">
          Apagar todos os dados
        </h2>
        <p className="pagina-subtitulo">
          Remove itens e ajustes salvos neste app. Exporte um backup antes.
        </p>
        <Button variante="perigo" className="ajustes-botao" onClick={() => setEtapaLimpar(1)}>
          <Trash2 size={18} aria-hidden="true" />
          Apagar tudo
        </Button>
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
