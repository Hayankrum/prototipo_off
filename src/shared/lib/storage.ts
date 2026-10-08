export interface InfoArmazenamento {
  uso: number
  quota: number
  percentual: number
  persistente: boolean
}

export async function solicitarPersistencia(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false
  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

export async function verificarPersistencia(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) return false
  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}

export async function estimarArmazenamento(): Promise<InfoArmazenamento> {
  const persistente = await verificarPersistencia()
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return { uso: 0, quota: 0, percentual: 0, persistente }
  }
  try {
    const estimativa = await navigator.storage.estimate()
    const uso = estimativa.usage ?? 0
    const quota = estimativa.quota ?? 0
    const percentual = quota > 0 ? Math.min(100, (uso / quota) * 100) : 0
    return { uso, quota, percentual, persistente }
  } catch {
    return { uso: 0, quota: 0, percentual: 0, persistente }
  }
}
