# Plano — base Vite fullstack (protótipo)

Um repo, um package.json, um deploy. Cliente offline-first (Dexie como fonte da
verdade local), nuvem como réplica sincronizada. Protótipo: sem dados a preservar —
mudanças de schema do Dexie podem recriar o banco (sem `.upgrade()`).

| Etapa | Descrição | Status |
|---|---|---|
| A | Preparar cliente para sincronizar (campos de sync, outbox, syncState) | ✅ |
| B | Pacote `shared/` com schemas Zod | ✅ |
| C | Servidor Hono + Prisma + better-auth, push idempotente, pull por cursor | ✅ |
| D | Dev e build unificados (um processo em produção) | ✅ |
| E | SyncEngine no cliente (push/pull em segundo plano) | ✅ |
| F | Conta e estado na interface | pendente |
| G | PWA e segurança | pendente |

Teste de aceitação completo (dois navegadores, offline, idempotência, PWA em
modo avião) fica para o final, depois da Etapa G.

## Notas pendentes

- **Etapa E (feita)**: outbox compactado por `(tabela, registroId)` antes de
  cada push; backoff 2s→5min; `get-session` é o probe de rede/sessão (falha de
  fetch = offline real, sem depender de `navigator.onLine`). Por isso o
  rate-limit do better-auth ficou só em produção (120/min) — em dev, free.
  Harness E2E (fake-indexeddb + servidor real) mora em `/tmp/opencode/e2e`,
  fora do repo.
- **Etapa F**: ao vincular conta em um app que já tem dados locais, enfileirar
  uma única vez todos os itens locais, **inclusive tombstones** (itens com
  `deletedAt`), para que a primeira sincronização leve o estado completo —
  inclusive exclusões — sem duplicar.
- Quando houver usuários reais, toda mudança de schema do Dexie exige nova
  `db.version(n)` com `.upgrade()` (o protótipo atual usa `version(1)` único e
  pode simplesmente recriar o IndexedDB).
