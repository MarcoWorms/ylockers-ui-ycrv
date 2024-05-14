import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from './Button'
import { useAccount, useConfig, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import useData from '@/hooks/useData'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import env from '@/lib/env'
import abis from '@/app/abis'
import { zeroAddress } from 'viem'
import A from './A'
import { TfiReceipt } from 'react-icons/tfi'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '@/lib/motion'

function GreatSuccess({ hash }: { hash: `0x${string}`}) {
  const config = useConfig()
  return <A href={`${config.getClient().chain.blockExplorers?.default.url}/tx/${hash}`} 
    target='_blank' rel="noreferrer">
    <div className="flex items-center gap-2">
      <TfiReceipt />
      <div>Rewards claimed!</div>
    </div>
  </A>
}

export default function ClaimAll({ className }: { className?: string }) {
  const { openConnectModal } = useConnectModal()
  const account = useAccount()
  const { data, refetch } = useData()
  const hasClaims = useMemo(() => data.rewards.claimable > 0n, [data])
  const disabled = useMemo(() => account.isConnected && !hasClaims, [account, hasClaims])
  const [success, setSuccess] = useState(false)

  const label = useMemo(() => {
    return account.isConnected ? 'Claim All' : 'Connect Wallet'
  }, [account])

  const range = useReadContract({
    address: env.YPRISMA_REWARDS_DISTRIBUTOR,
    abi: abis.SingleTokenRewardDistributor,
    functionName: 'getSuggestedClaimRange',
    args: [account.address ?? zeroAddress],
    query: { enabled: account.isConnected }
  })

  const simulation = useSimulateContract({
    address: env.YPRISMA_REWARDS_DISTRIBUTOR,
    abi: abis.SingleTokenRewardDistributor,
    functionName: 'claimWithRange',
    args: [range.data?.[0]!, range.data?.[1]!],
    query: { enabled: account.isConnected && range.isSuccess && hasClaims }
  })

  const write = useWriteContract()

  const receipt = useWaitForTransactionReceipt({ hash: write.data })

  const error = useMemo(() => 
    range.error
    || simulation.error
    || write.error
    || receipt.error,
  [range, simulation, write, receipt])

  const isError = useMemo(() => 
    (range.isError
    || simulation.isError 
    || write.isError
    || receipt.isError)
    && !error?.toString().includes('User denied transaction signature'),
  [range, simulation, write, receipt, error])

  useEffect(() => { 
    if (isError) console.error(error)
  }, [isError, error])

  const subtextKey = useMemo(() => {
    if (isError) return 'error'
    if (receipt.isLoading) 'confirming'
    if (receipt.isSuccess) 'success'
    return 'default'
  }, [isError, receipt])

  const subtext = useMemo(() => {
    if (isError) return <div>Claim error! Please contact support</div>
    if (receipt.isLoading) return <div>Confirming...</div>
    if (receipt.isSuccess) return <GreatSuccess hash={write.data!} />
    return <div></div>
  }, [isError, write, receipt])

  const theme = useMemo(() => {
    if (!account.isConnected) return 'transparent'
    if (receipt?.isLoading) return 'onit'
    return 'default'
  }, [account, receipt])

  useEffect(() => {
    if (receipt.isSuccess && !success) {
      refetch()
      setSuccess(true)
    }
  }, [receipt, refetch, success, setSuccess])

  const onClick = useCallback(() => {
    if (receipt?.isLoading) {
      return
    } else if (!account.isConnected) {
      openConnectModal?.()
    } else {
      write.writeContract(simulation.data!.request)
    }
  }, [account, openConnectModal, write, receipt, simulation])

  return <div className={`flex flex-col gap-2 ${className}`}>
    <div>
      <Button onClick={onClick} theme={theme} disabled={disabled}>{label}</Button>
    </div>
    <div className={`pl-3 font-thin text-xs ${isError ? 'text-charge-yellow' : ''}`}>
      <AnimatePresence initial={false}>
        <motion.div key={subtextKey}
          transition={springs.rollin}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }} >
          {subtext}
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
}
