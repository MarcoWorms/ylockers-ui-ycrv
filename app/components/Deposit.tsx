'use client'

import useData from '@/hooks/useData'
import InputExecute from './InputExecute'
import env from '@/lib/env'
import abis from '../abis'

export default function Deposit({ className }: { className?: string }) {
  const { data } = useData()
  return <InputExecute className={className} task={{
    verb: 'deposit',
    token: data.locker,
    needsApproval: true,
    parameters: {
      address: env.YPRISMA_STRATEGY,
      abi: abis.Strategy,
      functionName: 'deposit',
      args: (amount: bigint) => [amount, data.account]
    }
  }} />
}
