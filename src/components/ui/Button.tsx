import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} {...props}>
      {children}
    </button>
  )
})
