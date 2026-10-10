import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { TERMOS_VERSAO } from '@shared/termos'
import { formatarData } from '../../shared/lib/date'
import './termos.css'

const PUBLICADO_EM = new Date('2026-10-10').getTime()

const SECOES: { id: string; titulo: string; paragrafos: string[] }[] = [
  {
    id: 'objeto',
    titulo: '1. O que é este app',
    paragrafos: [
      'Este é um app de lista de itens (tarefas) que funciona offline: tudo é salvo primeiro no seu aparelho e, quando você conecta uma conta, sincronizado em segundo plano com a nuvem.',
      'Ao usar o app você concorda com estes Termos de uso e com a Política de privacidade abaixo. Sem o aceite, a sincronização com a nuvem fica bloqueada — o uso local do aparelho continua disponível.',
    ],
  },
  {
    id: 'conta',
    titulo: '2. Conta e cadastro',
    paragrafos: [
      'Para sincronizar é necessário criar uma conta com e-mail e senha. Você é responsável por manter sua senha em sigilo e por toda atividade feita com a sua conta.',
      'Informe um e-mail válido e real: ele é usado para entrar na conta e identificar seus dados na sincronização.',
      'A cada nova versão destes termos, pediremos que você aceite novamente antes de voltar a sincronizar.',
    ],
  },
  {
    id: 'dados',
    titulo: '3. Quais dados são coletados',
    paragrafos: [
      'Conta: e-mail, nome (opcional) e a senha, que é guardada apenas na forma de hash ilegível (não armazenamos a senha em texto puro).',
      'Sincronização: os itens que você cria, edita ou exclui, com data e hora das alterações, além do contador técnico usado para ordenar as mudanças.',
      'Sessão: data de criação e expiração, endereço IP e identificação do navegador/navegação, usados para manter a sessão segura e permitir o logout.',
      'Nada além disso é coletado: não há anúncios, rastreamento, analytics de terceiros, geolocalização, contatos ou câmera.',
    ],
  },
  {
    id: 'uso',
    titulo: '4. Para que os dados são usados',
    paragrafos: [
      'Exclusivamente para funcionar do jeito que o app promete: guardar seus itens, sincronizá-los entre os seus dispositivos e manter sua conta segura.',
      'Não vendemos, não alugamos e não compartilhamos seus dados com terceiros para marketing ou qualquer outra finalidade.',
    ],
  },
  {
    id: 'onde',
    titulo: '5. Onde os dados ficam',
    paragrafos: [
      'No aparelho: IndexedDB do navegador/instalação do app. Se você apagar os dados do navegador ou desinstalar o app, eles vão junto — por isso exporte um backup de vez em quando.',
      'Na nuvem: banco de dados PostgreSQL do servidor do app, sempre ligados ao seu usuário. Nada é enviado para a nuvem sem sua conta conectada.',
      'Enquanto você não entra em conta, nada sai do aparelho. Ao entrar, o que foi feito offline é enviado automaticamente.',
    ],
  },
  {
    id: 'exclusao',
    titulo: '6. Exclusão e saída',
    paragrafos: [
      'Você pode excluir itens individualmente a qualquer momento, e a exclusão é propagada para a nuvem na próxima sincronização.',
      'Em Ajustes existe a opção "Apagar todos os dados", que remove do aparelho os itens e ajustes (recomendamos exportar um backup antes).',
      'Para excluir a conta e todos os dados associados no servidor, solicite pelo canal de contato do projeto. A exclusão é definitiva.',
    ],
  },
  {
    id: 'seguranca',
    titulo: '7. Segurança',
    paragrafos: [
      'A conexão usa HTTPS, as sessões usam cookies que o JavaScript não consegue ler, as senhas são guardadas com hash e a sincronização só aceita dados do próprio usuário autenticado.',
      'Nenhum sistema é 100% seguro. Em caso de incidente relevante com seus dados, informaremos pelos meios de contato disponíveis no projeto.',
    ],
  },
  {
    id: 'responsabilidade',
    titulo: '8. Responsabilidades e limites',
    paragrafos: [
      'O app é fornecido como está. Use-o por sua conta e risco e mantenha backups dos dados importantes.',
      'Você é responsável pelo conteúdo dos itens que cria — não publique nele informações de terceiros sem permissão.',
      'Estes termos podem ser atualizados; quando a versão mudar, o app pede o aceite novamente. O uso continuado após o aceite da nova versão implica concordância com ela.',
    ],
  },
]

export function TermosPage() {
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-subtitulo">
            <Link className="termos-voltar" to="/">
              <ArrowLeft size={14} aria-hidden="true" />
              Início
            </Link>
          </p>
          <h1 className="pagina-titulo">Termos de uso e privacidade</h1>
          <p className="pagina-subtitulo termos-versao">
            Versão {TERMOS_VERSAO} · publicado em {formatarData(PUBLICADO_EM)}
          </p>
        </div>
      </div>

      <div className="aviso" role="note">
        <FileText size={16} aria-hidden="true" />
        <span>
          Este é um rascunho de termo para uso neste app. Para publicar, revise o texto e ajuste
          o canal de contato.
        </span>
      </div>

      <nav className="termos-indice cartao" aria-label="Seções dos termos">
        <p className="termos-indice-titulo">Nesta página</p>
        <ul>
          {SECOES.map((secao) => (
            <li key={secao.id}>
              <a href={`#${secao.id}`}>{secao.titulo}</a>
            </li>
          ))}
        </ul>
      </nav>

      {SECOES.map((secao) => (
        <section key={secao.id} id={secao.id} className="cartao termos-secao">
          <h2 className="cartao-titulo">{secao.titulo}</h2>
          {secao.paragrafos.map((paragrafo) => (
            <p key={paragrafo} className="termos-texto">
              {paragrafo}
            </p>
          ))}
        </section>
      ))}

      <p className="termos-rodape">
        Dúvidas sobre estes termos ou sobre seus dados? Use o canal de contato do projeto.
      </p>
    </div>
  )
}
