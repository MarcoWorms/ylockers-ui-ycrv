'use client'

import { formatUnits } from 'viem'

export default function Tokens({
  amount,
  decimals,
  accuracy,
  className
}: {
  amount: bigint
  decimals: number
  accuracy?: number 
  className?: string 
}) {
  const formatted = (() => {
    const n = Number(formatUnits(amount, decimals))
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: accuracy || 2,
      maximumFractionDigits: accuracy || 2
    })
    return formatter.format(n)
  })()

  return <span className={`${className}`}>
    {formatted}
  </span>
}
