import { z } from 'zod'
import { zhexstringSchema } from './types'

class DotEnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DotEnvError'
  }
}

const EnvSchema = z.object({
  PRISMA: zhexstringSchema,
  YPRISMA: zhexstringSchema,
  YPRISMA_BOOSTED_STAKER: zhexstringSchema,
  YPRISMA_BOOSTED_STAKER_UTILITIES: zhexstringSchema,
  YPRISMA_OLD_STAKER: zhexstringSchema,
  YPRISMA_REWARDS_DISTRIBUTOR: zhexstringSchema,
  YPRISMA_STRATEGY: zhexstringSchema,
  YVMKUSD: zhexstringSchema,
  MKUSD: zhexstringSchema,
  YDAEMON: z.string(),
  DEV: z.boolean()
})

const result = EnvSchema.safeParse({
  PRISMA: process.env.NEXT_PUBLIC_PRISMA,
  YPRISMA: process.env.NEXT_PUBLIC_YPRISMA,
  YPRISMA_BOOSTED_STAKER: process.env.NEXT_PUBLIC_YPRISMA_BOOSTED_STAKER,
  YPRISMA_BOOSTED_STAKER_UTILITIES: process.env.NEXT_PUBLIC_YPRISMA_BOOSTED_STAKER_UTILITIES,
  YPRISMA_OLD_STAKER: process.env.NEXT_PUBLIC_YPRISMA_OLD_STAKER,
  YPRISMA_REWARDS_DISTRIBUTOR: process.env.NEXT_PUBLIC_YPRISMA_REWARDS_DISTRIBUTOR,
  YPRISMA_STRATEGY: process.env.NEXT_PUBLIC_YPRISMA_STRATEGY,
  YVMKUSD: process.env.NEXT_PUBLIC_YVMKUSD,
  MKUSD: process.env.NEXT_PUBLIC_MKUSD,
  YDAEMON: process.env.NEXT_PUBLIC_YDAEMON,
  DEV: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
})

if (!result.success) {
  const messages = result.error.errors.map(e => `${e.path} ${e.message}`).join('\n')
  throw new DotEnvError(`\n------------\n\n${messages}\n\n------------\n`)
}

const env = result.data
export default env
