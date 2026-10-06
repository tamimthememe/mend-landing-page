import { FinalCta } from './sections/FinalCta.tsx'
import { FigmaVsBuild } from './sections/FigmaVsBuild.tsx'
import { Footer } from './sections/Footer.tsx'
import { FounderNote } from './sections/FounderNote.tsx'
import { Hero } from './sections/Hero.tsx'
import { HowItWorks } from './sections/HowItWorks.tsx'
import { MendboardsBanner } from './sections/MendboardsBanner.tsx'
import { Nav } from './sections/Nav.tsx'

export default function App() {
  return (
    <>
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
    </>
  )
}
