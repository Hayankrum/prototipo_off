import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { env } from './env'
import { prisma } from './prisma'

const origensDev = [
  ...new Set([
    new URL(env.APP_URL).origin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]),
]

export const auth = betterAuth({
  secret: env.AUTH_SECRET,
  baseURL: env.APP_URL,
  trustedOrigins: env.NODE_ENV === 'development' ? origensDev : [],
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
})
