'use client'

import { z } from 'zod'
import { useAccount, useConfig } from 'wagmi'
import { erc20Abi, zeroAddress } from 'viem'
import { zhexstring } from '@/lib/types'
import Tokens from '@/app/components/Tokens'
import { fAddress } from '@/lib/format'
import { useSuspenseQuery } from '@tanstack/react-query'
import { readContractQueryOptions, readContractsQueryOptions } from 'wagmi/query'
import React from 'react'

const tokenInfoSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  totalSupply: z.bigint({ coerce: true })
})

function useBurned(address: `0x${string}`) {
  return useSuspenseQuery(
    readContractQueryOptions(useConfig(), {
      address, abi: erc20Abi, 
      functionName: 'balanceOf', args: [zeroAddress]
    })
  )
}

function useTokenInfo(address: `0x${string}`) {
  const multicall = useSuspenseQuery(
    readContractsQueryOptions(useConfig(), { contracts: [
      { address, abi: erc20Abi, functionName: 'symbol' },
      { address, abi: erc20Abi, functionName: 'name' },
      { address, abi: erc20Abi, functionName: 'decimals' },
      { address, abi: erc20Abi, functionName: 'totalSupply' }
    ]})
  )

  return { ...multicall, data: tokenInfoSchema.parse({
    symbol: multicall.data?.[0]?.result,
    name: multicall.data?.[1]?.result,
    decimals: multicall.data?.[2]?.result,
    totalSupply: multicall.data?.[3]?.result
  })}
}

export default function Erc20({ address, className }: { address: zhexstring, className?: string}) {
  const { data: burned } = useBurned(address)
  const { data: tokenInfo } = useTokenInfo(address)

  return <div className={className}>
    <p>{fAddress(address)}</p>
    <p>info ({tokenInfo?.symbol}) {tokenInfo?.name}</p>
    <p>supply <Tokens amount={tokenInfo?.totalSupply ?? 0n} decimals={tokenInfo?.decimals ?? 18} /></p>
    <p>burned <Tokens amount={burned ?? 0n} decimals={tokenInfo?.decimals ?? 18} /></p>
  </div>
}
