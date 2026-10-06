import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { copy } from '../content/copy.ts'
import { EmailCapture } from '../components/ui/EmailCapture.tsx'
import {
  HeroLottieSequenceProvider,
  useHeroLottieSlotStyle,
  type HeroLottieId,
} from '../components/motion/HeroLottieSequence.tsx'
import { motionEase } from '../components/motion/heroSequencer.ts'
import { useReducedMotion } from '../components/motion/useReducedMotion.ts'
import { useMediaQuery } from '../lib/useMediaQuery.ts'
import { useSectionView } from '../lib/useSectionView.ts'
import { HeroUserCard } from './HeroUserCard.tsx'
import { HeroButton, HeroChart, HeroPayment, HeroToggle } from './HeroWidgets.tsx'

/**
 * Lottie slot placements (frame = layout box, display = Lottie canvas size).
 * Numbers are authored relative to an open canvas — the stage recenters/fits
 * their bounding box so nothing is clipped without editing these values.
 */
const placements = [
  {
    key: 'top-left',
    frame: { x: 140, y: 100.616, width: 333.404, height: 226.45 },
    display: { width: 381 * 1.5, height: 260 * 1.5 },
    rotation: 11,
    Widget: HeroUserCard,
  },
  {
    key: 'top-right',
    frame: { x: 1557.995, y: 180, width: 197, height: 125.542 },
    display: { width: 375 * 1.2, height: 239 * 1.2 },
    rotation: -27,
    Widget: HeroButton,
  },
  {
    key: 'center-left',
    frame: { x: 382.418, y: 520, width: 99, height: 56.571 },
    display: { width: 311 * 1.5, height: 155 * 1.5 },
    rotation: -19,
    Widget: HeroToggle,
  },
  {
    key: 'bottom-left',
    frame: { x: 150, y: 750.635, width: 271.312 * 1.2, height: 177.155 * 1.2 },
    display: { width: 336 * 1.8, height: 220 * 1.8 },
    rotation: 22,
    Widget: HeroChart,
  },
  {
    key: 'bottom-right',
    frame: { x: 1646.408, y: 610, width: 266, height: 340.641 },
    display: { width: 303 * 1.4, height: 381 * 1.4 },
    rotation: -14,
    Widget: HeroPayment,
  },
] as const

/** Bounding box of all slots — used so off-canvas coords still fit the viewport. */
const stageBounds = (() => {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const placement of placements) {
    const centerX = placement.frame.x + placement.frame.width / 2
    const centerY = placement.frame.y + placement.frame.height / 2
    const radians = (Math.abs(placement.rotation) * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    const boundW = placement.display.width * cos + placement.display.height * sin
    const boundH = placement.display.width * sin + placement.display.height * cos
    left = Math.min(left, centerX - boundW / 2)
    top = Math.min(top, centerY - boundH / 2)
    right = Math.max(right, centerX + boundW / 2)
    bottom = Math.max(bottom, centerY + boundH / 2)
  }
  const pad = 32
  return {
    x: left - pad,
    y: top - pad,
    width: Math.ceil(right - left + pad * 2),
    height: Math.ceil(bottom - top + pad * 2),
  }
})()

function HeroSlot({
  id,
  frame,
  display,
  rotation,
  children,
}: {
  id: HeroLottieId
  frame: { x: number; y: number; width: number; height: number }
  display: { width: number; height: number }
  rotation: number
  children: ReactNode
}) {
  const slotStyle = useHeroLottieSlotStyle(id)
  const centerX = frame.x + frame.width / 2 
  const centerY = frame.y + frame.height / 2 *1.15

  return (
    <div
      className="absolute"
      style={{
        // Offset into stage-local coords so placement numbers stay as authored.
        left: centerX - display.width / 2 - stageBounds.x,
        top: centerY - display.height / 2 - stageBounds.y,
        width: display.width,
        height: display.height,
        ...slotStyle,
      }}
    >
      <div className="h-full w-full" style={{ transform: `rotate(${-rotation}deg)` }}>
        {children}
      </div>
    </div>
  )
}

function ScaledHeroStage({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return

    const update = () => {
      const { width, height } = parent.getBoundingClientRect()
      if (width <= 0 || height <= 0) return
      // Fit the widget group in view, then pull back so Lotties don't dominate the hero type.
      const fit = Math.min(width / stageBounds.width, height / stageBounds.height)
      setScale(Math.min(fit, 1)*1.1)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={parentRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="relative shrink-0"
        style={{
          width: stageBounds.width,
          height: stageBounds.height,
          transform: `scale(${scale})`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function DesktopHeroWidgets() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <ScaledHeroStage>
        {placements.map((placement) => (
          <HeroSlot
            key={placement.key}
            id={placement.key}
            frame={placement.frame}
            display={placement.display}
            rotation={placement.rotation}
          >
            <placement.Widget />
          </HeroSlot>
        ))}
      </ScaledHeroStage>
    </div>
  )
}

function MobileHeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Keep unused slots mounted so the hero sequencer can finish on mobile. */}
      <div className="absolute size-0 overflow-hidden opacity-0">
        <HeroUserCard />
        <HeroChart />
        <HeroPayment />
      </div>
      <div className="absolute top-[8%] left-[-6%] w-[280px] origin-center rotate-[-18deg] sm:left-[2%]">
        <div className="h-[155px] w-full overflow-hidden">
          <div
            className="relative"
            style={{
              width: 375 * 1.2,
              height: 239 * 1.2,
              transform: 'scale(0.62)',
              transformOrigin: 'top left',
            }}
          >
            <HeroButton />
          </div>
        </div>
      </div>
      <div className="absolute right-[-2%] bottom-[10%] w-[180px] origin-center rotate-[12deg]">
        <div className="h-[140px] w-full overflow-hidden">
          <div
            className="relative"
            style={{
              width: 311 * 1.5,
              height: 155 * 1.5,
              transform: 'scale(0.55)',
              transformOrigin: 'top left',
            }}
          >
            <HeroToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tablet: four corners — user card, button, chart, payment (toggle mounted hidden for sequencer). */
function TabletHeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute size-0 overflow-hidden opacity-0">
        <HeroToggle />
      </div>

      {/* top-left — user card */}
      <div className="absolute top-[6%] left-[2%] w-[340px] origin-center rotate-[10deg] lg:left-[4%] lg:w-[400px]">
        <div className="h-[240px] w-full overflow-visible lg:h-[280px]">
          <div
            className="relative"
            style={{
              width: 381 * 1.5,
              height: 260 * 1.5,
              transform: 'scale(0.58)',
              transformOrigin: 'top left',
            }}
          >
            <HeroUserCard />
          </div>
        </div>
      </div>

      {/* top-right — button */}
      <div className="absolute top-[8%] right-[3%] w-[280px] origin-center rotate-[-22deg] lg:right-[5%] lg:w-[320px]">
        <div className="h-[180px] w-full overflow-visible lg:h-[200px]">
          <div
            className="relative"
            style={{
              width: 375 * 1.2,
              height: 239 * 1.2,
              transform: 'scale(0.62)',
              transformOrigin: 'top left',
            }}
          >
            <HeroButton />
          </div>
        </div>
      </div>

      {/* bottom-left — chart */}
      <div className="absolute bottom-[8%] left-[2%] w-[320px] origin-center rotate-[16deg] lg:left-[4%] lg:w-[380px]">
        <div className="h-[220px] w-full overflow-visible lg:h-[260px]">
          <div
            className="relative"
            style={{
              width: 336 * 1.8,
              height: 220 * 1.8,
              transform: 'scale(0.48)',
              transformOrigin: 'top left',
            }}
          >
            <HeroChart />
          </div>
        </div>
      </div>

      {/* bottom-right — payment */}
      <div className="absolute right-[2%] bottom-[2%] w-[280px] origin-center rotate-[-12deg] lg:right-[4%] lg:w-[340px]">
        <div className="h-[340px] w-full overflow-visible lg:h-[400px]">
          <div
            className="relative"
            style={{
              width: 303 * 1.4,
              height: 381 * 1.4,
              transform: 'scale(0.58)',
              transformOrigin: 'top left',
            }}
          >
            <HeroPayment />
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const layerRef = useRef<HTMLElement | null>(null)
  useSectionView('top', layerRef)
  const isDesktop = useMediaQuery('(min-width: 1280px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)')
  const reduced = useReducedMotion()

  const intro = {
    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
  }
  const introTransition = { duration: reduced ? 0 : 0.55, ease: motionEase }

  return (
    <section
      id="top"
      ref={layerRef}
      aria-labelledby="hero-heading"
      className="sticky top-0 z-0 flex h-svh min-h-[640px] flex-col overflow-hidden bg-bg xl:h-screen"
    >
      <HeroLottieSequenceProvider layerRef={layerRef}>
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="dot-grid absolute inset-0" />
        </div>
        {isDesktop ? <DesktopHeroWidgets /> : isTablet ? <TabletHeroDecor /> : <MobileHeroDecor />}
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 items-center px-4 md:px-12 xl:px-0">
          <motion.div
            className="relative mx-auto flex w-full max-w-[632px] flex-col items-center text-center"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: reduced ? 0 : 0.1, delayChildren: reduced ? 0 : 0.12 }}
          >
            <motion.h1
              id="hero-heading"
              variants={intro}
              transition={introTransition}
              className="font-heading text-[36px] leading-[1.15] tracking-[-1.2px] text-text sm:text-[40px] sm:tracking-[-1.6px] md:text-display md:tracking-[-2.88px]"
            >
              {copy.hero.headline.replace(' Mend it.', '')}
              <br />
              Mend it.
            </motion.h1>
            <motion.p
              variants={intro}
              transition={introTransition}
              className="mt-4 font-heading text-[16px] leading-snug font-light text-text-muted sm:text-body md:text-[20px] md:leading-[26px]"
            >
              {copy.hero.subline}
            </motion.p>
            <motion.div variants={intro} transition={introTransition} className="mt-8 w-full">
              <EmailCapture
                id="hero-email"
                list="main"
                source="hero"
                placeholder={copy.hero.emailPlaceholder}
                buttonLabel={copy.hero.button}
                className="w-full"
              />
            </motion.div>
            <motion.p
              variants={intro}
              transition={introTransition}
              className="mt-2.5 font-heading text-small font-normal text-text-tertiary"
            >
              {copy.hero.offer}
            </motion.p>
          </motion.div>
        </div>
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.45, ease: motionEase }}
          className="relative z-10 px-4 pb-6 text-center font-heading text-fine font-medium text-text-tertiary"
        >
          {copy.hero.footnote}
        </motion.p>
      </HeroLottieSequenceProvider>
    </section>
  )
}

