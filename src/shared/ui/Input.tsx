import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

interface CampoComum {
  label: string
  erro?: string
}

interface CampoInput extends CampoComum {
  /** Elemento à direita dentro do campo (ex.: botão de mostrar senha). */
  sufixo?: ReactNode
}

type InputProps = CampoInput & InputHTMLAttributes<HTMLInputElement>
type TextAreaProps = CampoComum & TextareaHTMLAttributes<HTMLTextAreaElement>

function useIds(idInformado: string | undefined) {
  const automatico = useId()
  const id = idInformado ?? automatico
  return { id, erroId: `${id}-erro` }
}

export function Input({ label, erro, id, className = '', sufixo, ...rest }: InputProps) {
  const ids = useIds(id)
  const controle = (
    <input
      id={ids.id}
      className={`campo-controle${sufixo ? ' campo-controle--com-sufixo' : ''} ${className}`.trim()}
      aria-invalid={erro ? true : undefined}
      aria-describedby={erro ? ids.erroId : undefined}
      {...rest}
    />
  )
  return (
    <div className="campo">
      <label className="campo-label" htmlFor={ids.id}>
        {label}
      </label>
      {sufixo ? (
        <div className="campo-envoltorio">
          {controle}
          {sufixo}
        </div>
      ) : (
        controle
      )}
      {erro ? (
        <p className="campo-erro" id={ids.erroId} role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  )
}

export function TextArea({ label, erro, id, className = '', rows = 4, ...rest }: TextAreaProps) {
  const ids = useIds(id)
  return (
    <div className="campo">
      <label className="campo-label" htmlFor={ids.id}>
        {label}
      </label>
      <textarea
        id={ids.id}
        rows={rows}
        className={`campo-controle campo-controle--area ${className}`.trim()}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? ids.erroId : undefined}
        {...rest}
      />
      {erro ? (
        <p className="campo-erro" id={ids.erroId} role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  )
}
