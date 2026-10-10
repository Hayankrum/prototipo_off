import { handle } from 'hono/vercel'
import { createApp } from '../server/app'

export default handle(createApp())
