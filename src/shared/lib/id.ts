export function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const alfabeto = '0123456789abcdef'
  let id = ''
  for (let i = 0; i < 36; i += 1) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += '-'
    } else if (i === 14) {
      id += '4'
    } else if (i === 19) {
      id += alfabeto[(Math.floor(Math.random() * 16) & 0x3) | 0x8]
    } else {
      id += alfabeto[Math.floor(Math.random() * 16)]
    }
  }
  return id
}
