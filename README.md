# Meu App

PWA **100% offline-first** feito com Vite + React + TypeScript, Dexie (IndexedDB) e Workbox
(`vite-plugin-pwa`, `generateSW`, `registerType: 'prompt'`).

A internet é usada **uma única vez**, para baixar o app. Depois da primeira abertura tudo funciona
sem rede: não existe estado "online/offline" no código, nenhum `fetch` em runtime e nenhuma URL
externa em HTML, JS ou CSS.

## Comandos

```bash
npm install
npm run dev        # desenvolvimento (sem Service Worker)
npm run build      # typecheck + build de produção
npm run preview    # serve dist/ — é aqui que o SW funciona
npm run typecheck  # só o TypeScript
npm run icons      # regenera os PNGs dos ícones a partir dos SVGs
```

> **Importante:** o Service Worker só fica ativo no `build` + `preview` (ou com
> `devOptions.enabled` no `vite.config.ts`). Para testar modo offline, use `npm run build` e
> `npm run preview` e marque **DevTools > Application > Service Workers > Offline**.

## Como trocar o nome (e as cores) do app

Tudo em um único lugar: `src/app/app.config.json`

```json
{
  "id": "meu-app",          // id estável usado no backup
  "name": "Meu App",        // nome completo (manifest, título, cabeçalho)
  "shortName": "Meu App",   // nome curto (tela inicial)
  "description": "...",
  "dbName": "MeuAppDB",     // nome do banco IndexedDB (mudar apaga dados existentes)
  "themeColor": "#0f172a",  // cor do manifesto/instalação
  "backgroundColor": "#f8fafc",
  "metaThemeColorClaro": "#f8fafc",
  "metaThemeColorEscuro": "#0f172a"
}
```

Exceções (para manter antes do React carregar):

- `index.html`: `<title>`, `apple-mobile-web-app-title` e as cores do `<script>` inline de tema
  (elas são aplicadas antes do bundle, para não piscar tema errado). O `document.title` é reescrito
  a partir do `app.config.json` em `src/main.tsx`.
- `package.json`: `name`/`version` (a versão entra no app via `define: { __APP_VERSION__ }`).

## Estrutura

```
src/
├── app/            App, router (createHashRouter), providers, AppShell, BottomNav
├── features/
│   ├── home/       resumo + atalho + aviso de backup
│   ├── items/      ItemsPage, ItemForm, ItemList, useItems, items.repo.ts
│   ├── about/      Sobre
│   ├── settings/   Configurações + useSettings
│   ├── theme/      ThemeProvider + themes.css (variáveis + data-theme)
│   └── pwa/        useInstallPrompt, InstallBanner, IOSInstallModal, UpdateToast
├── db/             database.ts (schema versionado), schema.ts, config.repo.ts
├── shared/
│   ├── ui/         Button, Input/TextArea, Modal, ConfirmDialog, Toast
│   └── lib/        backup.ts, date.ts, storage.ts, id.ts, texto.ts
└── main.tsx
```

Regras de camada:

- Componentes **nunca** importam o Dexie. Todo acesso passa por `items.repo.ts` e
  `config.repo.ts`; as telas leem com `useLiveQuery` através de `useItems` e `useSettings`.
- Tema: fonte oficial é a tabela `config` (chave `tema`), espelhada no `localStorage`
  (`meu-app:tema`) e aplicada por script inline antes do React carregar.
- Backup: `src/shared/lib/backup.ts` com formato
  `{ app, schemaVersion, exportadoEm, dados: { itens } }` e validação do arquivo.

## Ícones

SVGs em `public/icons/` (`icon.svg`, `icon-maskable.svg`) e `public/favicon.svg`.
PNGs gerados (192, 512, maskable 512, apple-touch-icon 180) — regenere com `npm run icons`
(requer `rsvg-convert`, ImageMagick ou Inkscape). Depois de trocar o desenho, rode o script e
refaça o `build`.

## Checklist de teste manual

1. `npm run build && npm run preview` e abrir `http://localhost:4173`.
2. Na primeira abertura, aparece o toast **"Pronto para uso offline"** (uma única vez).
3. DevTools > Application > Service Workers: status `activated`, marcar **Offline**.
4. Recarregar e navegar por todas as rotas: Início, Itens, Sobre, Configurações (offline).
5. Criar, editar, concluir/reabrir e excluir itens (com confirmação); busca e filtros.
6. Trocar tema (claro/escuro/sistema) e verificar `<meta name="theme-color">` e ausência de flash.
7. Exportar JSON, importar de volta (mesclar e substituir), validar arquivo inválido.
8. Apagar todos os dados com a dupla confirmação.
9. Popup de instalação: no Chromium, banner "Instalar/Agora não" (reaparece após 14 dias);
   no Safari/iOS, modal "Compartilhar → Adicionar à Tela de Início".
10. Nova versão: mudar algo, rebuild e reabrir — aparece "Nova versão disponível" com
    **Atualizar** (nunca recarrega sozinho).
11. Lighthouse (PWA): `npx lighthouse http://localhost:4173 --only-categories=pwa --view`.

## Limitações conhecidas

- **iOS/Safari** não dispara `beforeinstallprompt`: o fluxo é o modal manual de compartilhamento.
- **Safari (iOS)** ignora `navigator.storage.persist()`; o espaço não é garantido e dados podem
  ser removidos pelo navegador em baixo armazenamento.
- **Sem push notifications** e sem sincronização em segundo plano (`background sync`).
- O Service Worker só roda em contexto seguro (HTTPS ou `localhost`).
- Primeira visita ainda depende de rede; após o download, o app nunca mais precisa dela.
- Se o navegador for limpo (dados do site), os itens vão junto — use o backup em JSON.
