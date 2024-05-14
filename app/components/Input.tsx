import React, { forwardRef, InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return <input ref={ref} {...props} className={`
  w-full p-2 bg-input-bg rounded-lg
  ${className}`} />
})

Input.displayName = 'Input'

export default Input
