import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface CampoComum {
  label: string
  erro?: string
}

type InputProps = CampoComum & InputHTMLAttributes<HTMLInputElement>
type TextAreaProps = CampoComum & TextareaHTMLAttributes<HTMLTextAreaElement>

function useIds(idInformado: string | undefined) {
  const automatico = useId()
  const id = idInformado ?? automatico
  return { id, erroId: `${id}-erro` }
}

export function Input({ label, erro, id, className = '', ...rest }: InputProps) {
  const ids = useIds(id)
  return (
    <div className="campo">
      <label className="campo-label" htmlFor={ids.id}>
        {label}
      </label>
      <input
        id={ids.id}
        className={`campo-controle ${className}`.trim()}
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
