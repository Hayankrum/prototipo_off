const FORMATO_DATA: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

const FORMATO_DATA_HORA: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

export function formatarData(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', FORMATO_DATA)
}

export function formatarDataHora(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', FORMATO_DATA_HORA)
}

export function diasDesde(timestamp: number): number {
  const ms = Date.now() - timestamp
  return Math.floor(ms / 86_400_000)
}

export function formatarBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB']
  const indice = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1)
  const valor = bytes / 1024 ** indice
  const casas = indice === 0 || valor >= 100 ? 0 : 1
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: casas })} ${unidades[indice]}`
}
