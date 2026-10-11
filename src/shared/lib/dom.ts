const SELETOR_EDITAVEL = 'input, textarea, select'

/**
 * Fecha o teclado / barra de autocompletar do celular.
 *
 * Num SPA o campo pode desmontar (ou perder o foco) sem o navegador avisar, e a
 * barra fica presa na tela até um reload. Desfocar não basta quando o elemento
 * já saiu do DOM (o foco cai no `body`), então: desfoca qualquer campo editável
 * que ainda esteja com foco e move o foco para um elemento não editável — só
 * assim o Android fecha o teclado.
 */
export function soltarCampoFocado(): void {
  const ativo = document.activeElement
  if (
    ativo instanceof HTMLInputElement ||
    ativo instanceof HTMLTextAreaElement ||
    ativo instanceof HTMLSelectElement
  ) {
    ativo.blur()
  }

  // Redundância defensiva: se algum campo estiver focado sem ser o ativo
  // (casos estranhos de autofill), desfoca todos.
  document.querySelectorAll<HTMLElement>(SELETOR_EDITAVEL).forEach((campo) => {
    if (campo === document.activeElement) campo.blur()
  })

  const principal = document.getElementById('conteudo')
  if (principal instanceof HTMLElement) {
    principal.focus({ preventScroll: true })
  }
}
