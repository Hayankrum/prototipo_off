import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { auth } from './auth'
import { env } from './env'
import { syncRoutes } from './sync'

export function createApp(): Hono {
  const app = new Hono()

  app.get('/api/health', (c) => c.json({ ok: true, servico: 'base-app' }))

  app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

  app.route('/api', syncRoutes)

  if (env.NODE_ENV === 'production') {
    // Assets com hash: cache longo. sw.js e index.html: sempre revalidar.
    app.use('/assets/*', (c, next) => {
      c.header('Cache-Control', 'public, max-age=31536000, immutable')
      return next()
    })
    app.use('/sw.js', (c, next) => {
      c.header('Cache-Control', 'no-cache')
      return next()
    })
    app.use('/index.html', (c, next) => {
      c.header('Cache-Control', 'no-cache')
      return next()
    })
    app.use('/manifest.webmanifest', (c, next) => {
      c.header('Cache-Control', 'no-cache')
      return next()
    })
    app.use('/*', serveStatic({ root: './dist' }))
    // Fallback de rotas do cliente (hash router: qualquer path serve o index)
    app.get('/*', serveStatic({ path: './dist/index.html' }))
  }

  return app
}
