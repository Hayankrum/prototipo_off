import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma'
type Tamanho = 'padrao' | 'pequeno' | 'icone'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamanho?: Tamanho
  block?: boolean
}

export function Button({
  variante = 'primario',
  tamanho = 'padrao',
  block = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variante}`,
    `btn--${tamanho}`,
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <button type={type} className={classes} {...rest} />
}
