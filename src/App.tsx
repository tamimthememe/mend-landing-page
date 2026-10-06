import { motion } from 'motion/react'
import { FinalCta } from './sections/FinalCta.tsx'
import { FigmaVsBuild } from './sections/FigmaVsBuild.tsx'
import { Footer } from './sections/Footer.tsx'
import { FounderNote } from './sections/FounderNote.tsx'
import { Hero } from './sections/Hero.tsx'
import { HowItWorks } from './sections/HowItWorks.tsx'
import { MendboardsBanner } from './sections/MendboardsBanner.tsx'
import { Nav } from './sections/Nav.tsx'
import { motionEase } from './components/motion/heroSequencer.ts'
import { useReducedMotion } from './components/motion/useReducedMotion.ts'

export default function App() {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.65, ease: motionEase }}
    >
      <Nav />
      <main>
        <Hero />
        {/* Scrolls up over the sticky hero */}
        <div className="relative z-10 flex flex-col bg-bg">
          <div className="flex flex-col gap-[72px] xl:gap-[96px]">
            <HowItWorks />
            <FigmaVsBuild />
          </div>
          <div className="mt-[96px] flex flex-col">
            <MendboardsBanner />
            <FounderNote />
            <FinalCta />
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
