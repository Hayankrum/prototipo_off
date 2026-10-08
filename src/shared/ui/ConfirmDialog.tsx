import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  mensagem: string
  textoConfirmar?: string
  textoCancelar?: string
  perigo?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}

export function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = false,
  aoConfirmar,
  aoCancelar,
}: ConfirmDialogProps) {
  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      onFechar={aoCancelar}
      largura="estreito"
      rodape={
        <>
          <Button variante="secundario" onClick={aoCancelar}>
            {textoCancelar}
          </Button>
          <Button variante={perigo ? 'perigo' : 'primario'} onClick={aoConfirmar}>
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <p className="modal-texto">{mensagem}</p>
    </Modal>
  )
}
