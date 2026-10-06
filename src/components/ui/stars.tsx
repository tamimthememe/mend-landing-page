import * as React from 'react'
import {
  type HTMLMotionProps,
  motion,
  type SpringOptions,
  type Transition,
  useMotionValue,
  useSpring,
} from 'motion/react'

import { cn } from '../../lib/utils.ts'
import { useReducedMotion } from '../motion/useReducedMotion.ts'

type StarLayerProps = HTMLMotionProps<'div'> & {
  count: number
  size: number
  transition: Transition
  starColor: string
  animate: boolean
}

function generateStars(count: number, starColor: string, spreadX: number, spreadY: number) {
  const shadows: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * spreadX)
    const y = Math.floor(Math.random() * spreadY) - spreadY / 2
    shadows.push(`${x}px ${y}px ${starColor}`)
  }
  return shadows.join(', ')
}

function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: 'linear' },
  starColor = '#fff',
  animate,
  className,
  ...props
}: StarLayerProps) {
  const [boxShadow, setBoxShadow] = React.useState<string>('')

  React.useEffect(() => {
    const paint = () => {
      const spreadX = Math.max(window.innerWidth * 1.5, 4000)
      const spreadY = Math.max(window.innerHeight * 2, 4000)
      setBoxShadow(generateStars(count, starColor, spreadX, spreadY))
    }
    paint()
    window.addEventListener('resize', paint)
    return () => window.removeEventListener('resize', paint)
  }, [count, starColor])

  return (
    <motion.div
      data-slot="star-layer"
      animate={animate ? { y: [0, -2000] } : { y: 0 }}
      transition={animate ? transition : { duration: 0 }}
      className={cn('absolute top-0 left-0 h-[2000px] w-full', className)}
      {...props}
    >
      <div
        className="absolute rounded-full bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow,
        }}
      />
      <div
        className="absolute top-[2000px] rounded-full bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow,
        }}
      />
    </motion.div>
  )
}

type StarsBackgroundProps = React.ComponentProps<'div'> & {
  factor?: number
  speed?: number
  transition?: SpringOptions
  starColor?: string
}

export function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = '#fff',
  ...props
}: StarsBackgroundProps) {
  const reducedMotion = useReducedMotion()
  const offsetX = useMotionValue(0)
  const offsetY = useMotionValue(0)

  const springX = useSpring(offsetX, transition)
  const springY = useSpring(offsetY, transition)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (reducedMotion) return
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      offsetX.set(-(e.clientX - centerX) * factor)
      offsetY.set(-(e.clientY - centerY) * factor)
    },
    [offsetX, offsetY, factor, reducedMotion],
  )

  return (
    <div
      data-slot="stars-background"
      className={cn('relative size-full overflow-hidden bg-bg', className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div style={{ x: springX, y: springY }} className="pointer-events-none absolute inset-0">
        <StarLayer
          count={1000}
          size={1}
          animate={!reducedMotion}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
          starColor={starColor}
        />
        <StarLayer
          count={400}
          size={2}
          animate={!reducedMotion}
          transition={{
            repeat: Infinity,
            duration: speed * 2,
            ease: 'linear',
          }}
          starColor={starColor}
        />
        <StarLayer
          count={200}
          size={3}
          animate={!reducedMotion}
          transition={{
            repeat: Infinity,
            duration: speed * 3,
            ease: 'linear',
          }}
          starColor={starColor}
        />
      </motion.div>
      {children}
    </div>
  )
}

export default StarsBackground
