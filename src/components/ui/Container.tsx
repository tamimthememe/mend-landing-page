import type { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1920px] px-4 md:px-12 xl:px-page ${className}`}>
      {children}
    </div>
  )
}
