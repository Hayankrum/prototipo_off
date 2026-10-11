const EH_CAMPO = (el: Element | null): el is HTMLElement =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement

/**
 * Desfoca o campo ativo (se houver). Num SPA o campo pode desmontar com o foco
 * ainda nele e, em celular, a barra de autocompletar/teclado não some sozinha.
 */
export function soltarCampoFocado(): void {
  const ativo = document.activeElement
  if (EH_CAMPO(ativo)) ativo.blur()
}
