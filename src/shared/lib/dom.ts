const EH_CAMPO = (el: Element | null): el is HTMLElement =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement

/**
 * Fecha o teclado / barra de autocompletar do celular.
 *
 * Num SPA o campo pode desmontar (ou perder o foco) sem o navegador avisado,
 * e aí a barra fica presa na tela. Desfocar não basta quando o elemento já saiu
 * do DOM (o foco cai no `body`); é preciso mover o foco de volta para um
 * elemento não editável — aí o teclado fecha.
 */
export function soltarCampoFocado(): void {
  const ativo = document.activeElement
  if (EH_CAMPO(ativo)) ativo.blur()

  const principal = document.getElementById('conteudo')
  if (principal instanceof HTMLElement && principal !== ativo) {
    principal.focus({ preventScroll: true })
  }
}
