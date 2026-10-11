import { useState, type FormEvent } from 'react'
import { Button } from '../../shared/ui/Button'
import { Input, TextArea } from '../../shared/ui/Input'
import type { Item } from '../../db/schema'
import type { EntradaItem } from './items.repo'

export interface ItemFormProps {
  item?: Item
  aoCancelar: () => void
  aoSalvar: (entrada: EntradaItem) => Promise<void>
}

const LIMITE_TITULO = 120
const LIMITE_DESCRICAO = 2000

export function ItemForm({ item, aoCancelar, aoSalvar }: ItemFormProps) {
  const [titulo, setTitulo] = useState(item?.titulo ?? '')
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const tituloLimpo = titulo.trim()
    if (tituloLimpo === '') {
      setErro('Informe um título para o item.')
      return
    }
    if (tituloLimpo.length > LIMITE_TITULO) {
      setErro(`O título pode ter no máximo ${LIMITE_TITULO} caracteres.`)
      return
    }
    if (descricao.length > LIMITE_DESCRICAO) {
      setErro(`A descrição pode ter no máximo ${LIMITE_DESCRICAO} caracteres.`)
      return
    }
    setErro(null)
    setSalvando(true)
    try {
      await aoSalvar({ titulo: tituloLimpo, descricao: descricao.trim() })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={(evento) => void enviar(evento)} noValidate>
      <Input
        label="Título"
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
        placeholder="Ex.: Comprar mantimentos"
        maxLength={LIMITE_TITULO}
        erro={erro ?? undefined}
        required
      />
      <TextArea
        label="Descrição"
        value={descricao}
        onChange={(evento) => setDescricao(evento.target.value)}
        placeholder="Detalhes opcionais (fica salvo só no seu dispositivo)"
        maxLength={LIMITE_DESCRICAO}
      />
      <div className="formulario-acoes">
        <Button variante="secundario" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
