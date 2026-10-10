import { getRequestListener } from '@hono/node-server'
import { createApp } from './app'

// Entrada da Function do Vercel (api/index.js, gerado por `npm run build:function`).
// Assinatura clássica do Vercel: (req: IncomingMessage, res: ServerResponse) => void.
export default getRequestListener(createApp().fetch)
