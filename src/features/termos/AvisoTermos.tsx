import { useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'
import { TERMOS_VERSAO } from '@shared/termos'
import { useAceiteTermos } from '../conta/useTermos'
import { SECOES_TERMOS, TERMOS_PUBLICADO_EM } from './conteudo'
import { formatarData } from '../../shared/lib/date'
import './termos.css'

/**
 * Pop-up obrigatório para quem ainda não aceitou a versão vigente dos termos:
 * o texto completo aparece aqui mesmo, com o botão de aceitar logo abaixo.
 */
export function AvisoTermos() {
  const { estado, erro, aceitando, aceitarAgora } = useAceiteTermos()
  const [adiado, setAdiado] = useState(false)

  if (estado !== 'pendente' || adiado) return null

  return (
    <Modal
      aberto
      titulo="Termos de uso e privacidade"
      onFechar={() => setAdiado(true)}
      rodape={
        <>
          <Button variante="secundario" onClick={() => setAdiado(true)} disabled={aceitando}>
            Depois
          </Button>
          <Button variante="primario" onClick={() => void aceitarAgora()} disabled={aceitando}>
            {aceitando ? 'Registrando…' : 'Li e aceito os termos'}
          </Button>
        </>
      }
    >
      <div className="termos-corpo">
        <p className="termos-corpo-resumo">
          Versão {TERMOS_VERSAO}, publicada em {formatarData(TERMOS_PUBLICADO_EM)}. Enquanto você
          não aceitar, a sincronização com a nuvem fica suspensa — seus itens seguem salvos neste
          aparelho.
        </p>
        {SECOES_TERMOS.map((secao) => (
          <section key={secao.id} className="termos-corpo-secao">
            <h3 className="termos-corpo-titulo">{secao.titulo}</h3>
            {secao.paragrafos.map((paragrafo) => (
              <p key={paragrafo} className="termos-corpo-texto">
                {paragrafo}
              </p>
            ))}
          </section>
        ))}
        <p className="termos-rodape">
          Dúvidas sobre estes termos ou sobre seus dados? Use o canal de contato do projeto.
        </p>
        {erro ? (
          <p className="termos-erro" role="alert">
            {erro}
          </p>
        ) : null}
      </div>
    </Modal>
  )
}
