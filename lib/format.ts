import { formatUnits } from 'viem'

export function fPercent(amount: number, fixed?: number) {
  const formattedAmount = (amount * 100).toFixed(isNaN(fixed as number) ? 2 : fixed);
  const parts = formattedAmount.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${parts.join('.')}%`;
}

export function fAddress(address: `0x${string}`) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function fUSD(amount: number, options?: { fixed?: number }) {
  return fNumber(amount, { ...options, prefix: '$' })
}

export function fTokens(amount: bigint, decimals: number, options?: { accuracy?: number, padStart?: number }) {
  const { accuracy, padStart } = options || {}
  const units = formatUnits(amount, decimals)
  const separator = Intl.NumberFormat().format(1.1).charAt(1)
  const [ whole, fraction ] = units.split(separator)
  return `${whole.padStart(padStart || 0, '0')}.${(fraction || '0'.repeat(accuracy || 2)).slice(0, accuracy || 2)}`
}

export function fNumber(amount: number, options?: { fixed?: number, prefix?: string }) {
  const fixed = Number.isInteger(options?.fixed) ? options?.fixed : 2
  let result = ''
  if(!Number.isFinite(amount)) result = 'NaN'
  else if (amount < 1000) result = amount.toFixed(fixed)
  else if (amount < 1e6) result = `${(amount / 1e3).toFixed(fixed)}K`
  else if (amount < 1e9) result = `${(amount / 1e6).toFixed(fixed)}M`
  else if (amount < 1e12) result = `${(amount / 1e9).toFixed(fixed)}B`
  else result = `${(amount / 1e12).toFixed(fixed)}T`
  if (options?.prefix) return `${options.prefix} ${result}`
  return result
}
