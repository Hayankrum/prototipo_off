import { gerarId } from '../shared/lib/id'
import type { EntradaOutbox, Item, OperacaoOutbox } from './schema'

export function novaMutacao(
  tabela: string,
  registro: Item,
  operacao: OperacaoOutbox,
  criadoEm: number,
): EntradaOutbox {
  return {
    id: gerarId(),
    tabela,
    registroId: registro.id,
    operacao,
    payload: registro,
    criadoEm,
    tentativas: 0,
  }
}
