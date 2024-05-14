import { z } from 'zod'

export const zhexstringSchema = z.custom<`0x${string}`>((val: any) => /^0x/.test(val), 'Required')
export type zhexstring = z.infer<typeof zhexstringSchema>
