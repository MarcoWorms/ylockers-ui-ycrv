import { ChangeEvent, useCallback, useMemo, type ReactElement } from 'react'
import { formatUnits, maxUint256 } from 'viem'
import Input from './Input'
import Button from './Button'
import { useCall } from 'wagmi'

type Props = {
  decimals: number
	amount: bigint
  min?: bigint
	max?: bigint
	placeholder?: string
	disabled?: boolean
	onChange?: (amount: bigint) => void
	onMaxClick?: () => void
}

export function InputTokenAmount({
  decimals,
	amount,
  min,
	max,
	placeholder,
	disabled,
	onChange,
	onMaxClick
}: Props): ReactElement {

  const inputClassName = useMemo(() => {
    return `font-mono
    ${max && !disabled ? 'pr-16' : ''}
    ${disabled ? 'disabled-text' : ''}`
  }, [max, disabled])

  const maxButtonClassName = useMemo(() => {
    return `absolute z-10 right-2 h-6 px-2 
    flex items-center text-xs
    ${!!onMaxClick && !!max && !disabled && max !== 0n ? '' : 'hidden pointer-events-none'}`
  }, [onMaxClick, max, disabled])

  const humanize = useCallback((amount: bigint) => {
    return Number(formatUnits(amount, decimals))
  }, [decimals])

  const dehumanize = useCallback((input: string) => {
    return BigInt(Number(input) * 10 ** decimals)
  }, [decimals])

  const _onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = dehumanize(e.target.value)
    if (onChange 
      && (value >= (min !== undefined ? min : 0n)) 
      && (value <= (max !== undefined ? max : maxUint256))) {
      onChange(value)
    }
  }, [onChange, min, max, dehumanize])

	return <div className="relative flex w-full items-center justify-center">
    <Input type="number"
      className={inputClassName}
      value={humanize(amount)}
      onChange={_onChange}
      min={humanize(min !== undefined ? min : 0n)}
      max={humanize(max !== undefined ? max : maxUint256)}
      step={1}
      placeholder={disabled ? '' : placeholder ?? '0'}
      disabled={disabled}
    />
    <div className="absolute z-0 right-0 w-14 h-full"></div>
    <Button onClick={onMaxClick ? (): void => onMaxClick() : undefined}
      className={maxButtonClassName} disabled={disabled}>
      {'Max'}
    </Button>
  </div>
}