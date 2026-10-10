import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'
import { useToast } from '../../shared/ui/Toast'
import { useTermos } from '../conta/useTermos'
import { sincronizarAgora } from '../../sync/syncEngine'
import './termos.css'

/**
 * Pop-up obrigatório para quem ainda não aceitou a versão vigente dos termos:
 * aparece para contas já cadastradas assim que há sessão local.
 */
export function AvisoTermos() {
  const { estado, erro, aceitar } = useTermos()
  const { mostrar } = useToast()
  const [adiado, setAdiado] = useState(false)
  const [aceitando, setAceitando] = useState(false)

  if (estado !== 'pendente' || adiado) return null

  async function aceitarAgora() {
    setAceitando(true)
    try {
      const ok = await aceitar()
      if (ok) {
        mostrar('Termos aceitos. Sincronizando seus itens…', { tipo: 'sucesso' })
        void sincronizarAgora()
      } else {
        mostrar('Não foi possível registrar o aceite. Tente de novo.', { tipo: 'erro' })
      }
    } finally {
      setAceitando(false)
    }
  }

  return (
    <Modal
      aberto
      titulo="Atualização dos termos"
      onFechar={() => setAdiado(true)}
      largura="estreito"
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
      <p className="modal-texto">
        Nossa Política de privacidade e os Termos de uso foram atualizados (versão vigente).
        Enquanto você não aceitar, a sincronização com a nuvem fica suspensa — seus itens seguem
        salvos neste aparelho.
      </p>
      <p className="modal-texto">
        <Link to="/termos" onClick={() => setAdiado(true)}>
          Ler os termos completos
        </Link>
      </p>
      {erro ? (
        <p className="termos-erro" role="alert">
          {erro}
        </p>
      ) : null}
    </Modal>
  )
}
