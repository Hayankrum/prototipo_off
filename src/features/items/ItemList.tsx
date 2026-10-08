import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../shared/ui/Button'
import type { Item } from '../../db/schema'
import { formatarData } from '../../shared/lib/date'

export interface ItemListProps {
  itens: Item[]
  filtrando: boolean
  aoAlternar: (item: Item) => void
  aoEditar: (item: Item) => void
  aoExcluir: (item: Item) => void
  aoCriar: () => void
}

export function ItemList({
  itens,
  filtrando,
  aoAlternar,
  aoEditar,
  aoExcluir,
  aoCriar,
}: ItemListProps) {
  if (itens.length === 0) {
    return (
      <div className="lista-vazia">
        {filtrando ? (
          <>
            <p className="lista-vazia-titulo">Nenhum item encontrado</p>
            <p>Tente outro termo ou troque o filtro.</p>
          </>
        ) : (
          <>
            <p className="lista-vazia-titulo">Você ainda não tem itens</p>
            <p>Crie o primeiro item para começar.</p>
            <Button onClick={aoCriar}>
              <Plus size={18} aria-hidden="true" />
              Criar item
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <ul className="itens-lista">
      {itens.map((item) => (
        <li key={item.id} className={`item-cartao${item.concluido ? ' item-cartao--concluido' : ''}`}>
          <button
            type="button"
            className="item-concluir"
            role="checkbox"
            aria-checked={item.concluido}
            aria-label={
              item.concluido
                ? `Reabrir item ${item.titulo}`
                : `Concluir item ${item.titulo}`
            }
            onClick={() => aoAlternar(item)}
          >
            <Check size={16} aria-hidden="true" />
          </button>

          <div className="item-corpo">
            <p className="item-titulo">{item.titulo}</p>
            {item.descricao ? <p className="item-descricao">{item.descricao}</p> : null}
            <p className="item-data">criado em {formatarData(item.criadoEm)}</p>
          </div>

          <div className="item-acoes">
            <button
              type="button"
              className="item-acao"
              aria-label={`Editar item ${item.titulo}`}
              onClick={() => aoEditar(item)}
            >
              <Pencil size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="item-acao item-acao--perigo"
              aria-label={`Excluir item ${item.titulo}`}
              onClick={() => aoExcluir(item)}
            >
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
