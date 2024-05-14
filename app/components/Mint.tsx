'use client'

import useData from '@/hooks/useData'
import InputExecute from './InputExecute'
import env from '@/lib/env'
import abis from '../abis'

export default function Mint({ className }: { className?: string }) {
  const { data } = useData()
  return <InputExecute className={className} task={{
    verb: 'mint',
    token: data.asset,
    needsApproval: true,
    parameters: {
      address: env.YPRISMA,
      abi: abis.yPrisma,
      functionName: 'mint',
      args: (amount: bigint) => [amount, data.account]
    }
  }} />
}
