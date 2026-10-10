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
| F | Conta e estado na interface | ✅ |
| G | PWA e segurança | ✅ |

## Notas pendentes

- **Etapa E (feita)**: outbox compactado por `(tabela, registroId)` antes de
  cada push; backoff 2s→5min; `get-session` é o probe de rede/sessão (falha de
  fetch = offline real, sem depender de `navigator.onLine`) — por isso o
  rate-limit do better-auth ficou só em produção (120/min), em dev free.
- **Etapa F (feita)**: rota `/conta` (entrar/criar conta, sair, status do sync
  com "Sincronizar agora") + indicador de fase no TopNav. Ao conectar conta:
  enfileira na outbox **todos os itens sem mutação pendente, inclusive
  tombstones** (a compactação por registro garante "sem duplicar"); guarda de
  troca de conta: `ultimoUsuarioId` em `config` — se o login for de outra
  conta, itens+outbox são apagados e o cursor volta a `0` (não mistura
  contas). Saída limpa só a sessão local; os dados ficam no aparelho.
- **Etapa G (feita)**: CSP estrita (`script-src 'self'` — o tema anti-flash saiu
  do inline e virou `public/theme-init.js`, versionado no precache), headers de
  segurança em `server/app.ts` (nosniff, frame-ancestors DENY, referrer,
  permissions-policy, COOP/CORP; HSTS + `upgrade-insecure-requests` quando
  `APP_URL` é https), `bodyLimit` de 2 MB em `/api/*` (413 acima disso).
  `theme-init.js` servido com `Cache-Control: no-cache` junto com index/sw/manifest.
  Auditoria: better-auth telemetry off por padrão (1.7.7), cookies HttpOnly +
  SameSite + checagem de Origin, Prisma parametrizado, segredos só no `.env`.
- **Falta (passo final, após G)**: teste de aceitação completo — dois
  navegadores reais, offline/modo avião e idempotência (a aproximação
  automatizada de dois "dispositivos" via harness Node já cobre sync em
  processos separados contra o mesmo servidor).
- Quando houver usuários reais, toda mudança de schema do Dexie exige nova
  `db.version(n)` com `.upgrade()` (o protótipo atual usa `version(1)` único e
  pode simplesmente recriar o IndexedDB).
