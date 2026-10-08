#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const pastaIcones = join(raiz, 'public', 'icons')

const alvos = [
  { origem: join(pastaIcones, 'icon.svg'), destino: join(pastaIcones, 'icon-192.png'), tamanho: 192 },
  { origem: join(pastaIcones, 'icon.svg'), destino: join(pastaIcones, 'icon-512.png'), tamanho: 512 },
  {
    origem: join(pastaIcones, 'icon-maskable.svg'),
    destino: join(pastaIcones, 'icon-maskable-512.png'),
    tamanho: 512,
  },
  { origem: join(pastaIcones, 'icon.svg'), destino: join(raiz, 'public', 'apple-touch-icon.png'), tamanho: 180 },
]

mkdirSync(pastaIcones, { recursive: true })

function converter(comando, argumentos) {
  execFileSync(comando, argumentos, { stdio: 'pipe' })
}

function tentarConversao(alvo) {
  const tentativas = [
    () => converter('rsvg-convert', ['-w', String(alvo.tamanho), '-h', String(alvo.tamanho), '-o', alvo.destino, alvo.origem]),
    () => converter('magick', ['-background', 'none', alvo.origem, '-resize', `${alvo.tamanho}x${alvo.tamanho}`, alvo.destino]),
    () => converter('convert', ['-background', 'none', alvo.origem, '-resize', `${alvo.tamanho}x${alvo.tamanho}`, alvo.destino]),
    () => converter('inkscape', [alvo.origem, `--export-width=${alvo.tamanho}`, `--export-filename=${alvo.destino}`]),
  ]
  for (const tentativa of tentativas) {
    try {
      tentativa()
      if (existsSync(alvo.destino)) return true
    } catch {
      // tenta a próxima ferramenta
    }
  }
  return false
}

let falhas = 0
for (const alvo of alvos) {
  if (!existsSync(alvo.origem)) {
    console.error(`Origem ausente: ${alvo.origem}`)
    falhas += 1
    continue
  }
  if (tentarConversao(alvo)) {
    console.log(`OK  ${alvo.destino}`)
  } else {
    console.error(`FALHOU ${alvo.destino} (instale rsvg-convert, ImageMagick ou Inkscape)`)
    falhas += 1
  }
}

if (falhas > 0) process.exit(1)
