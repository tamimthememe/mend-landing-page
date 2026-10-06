import { useEffect, useRef, useState } from 'react'
import { copy } from '../content/copy.ts'
import { Container } from '../components/ui/Container.tsx'
import { VideoSlot } from '../components/motion/VideoSlot.tsx'
import { useMediaQuery } from '../lib/useMediaQuery.ts'
import { useSectionView } from '../lib/useSectionView.ts'
import step1Poster from '../assets/images/posters/step-1-poster.png'
import step2Poster from '../assets/images/posters/step-2-poster.png'
import step3Poster from '../assets/images/posters/step-3-poster.png'
import step1Video from '../assets/video/step-1.mp4'
import step2Video from '../assets/video/step-2.mp4'
import step3Video from '../assets/video/step-3.mp4'

const panels = [
  {
    src: step1Video,
    poster: step1Poster,
    width: 640,
    height: 686,
    label: 'Scan: Mend crawling an app and finding UI issues',
  },
  {
    src: step2Video,
    poster: step2Poster,
    width: 640,
    height: 684,
    label: 'Audit: reviewing UI issues in a table with fixes ready',
  },
  {
    src: step3Video,
    poster: step3Poster,
    width: 640,
    height: 684,
    label: 'Ship: verifying fixes and shipping with a complete score',
  },
] as const

export function HowItWorks() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeIndex, setActiveIndex] = useState(0)
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const sectionRef = useSectionView('how-it-works')

  const marker = 'found and fixed.'
  const lead = copy.howItWorks.headline.endsWith(marker)
    ? copy.howItWorks.headline.slice(0, -marker.length)
    : copy.howItWorks.headline
  const accent = copy.howItWorks.headline.endsWith(marker) ? marker : ''

  useEffect(() => {
    if (!isDesktop) return

    const updateActive = () => {
      const mid = window.innerHeight / 2
      let best = 0
      let bestDist = Number.POSITIVE_INFINITY

      stepRefs.current.forEach((node, index) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const dist = Math.abs(center - mid)
        if (dist < bestDist) {
          bestDist = dist
          best = index
        }
      })

      setActiveIndex((current) => (current === best ? current : best))
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    window.addEventListener('resize', updateActive)
    return () => {
      window.removeEventListener('scroll', updateActive)
      window.removeEventListener('resize', updateActive)
    }
  }, [isDesktop])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="bg-bg pt-12 xl:pt-[96px]"
    >
      <Container>
        <h2
          id="how-it-works-heading"
          className="mx-auto max-w-[591px] text-center font-heading text-[28px] leading-[1.15] tracking-[-0.48px] text-text sm:text-[32px] md:text-heading"
        >
          {lead}
          <span className="text-text-accent">{accent}</span>
        </h2>

        {isDesktop ? (
          <div className="mt-12 grid grid-cols-[minmax(0,1fr)_minmax(360px,640px)] gap-[72px] xl:mt-21 xl:gap-[96px] min-[1800px]:grid-cols-[minmax(0,1fr)_minmax(420px,856px)] min-[1800px]:gap-[112px]">
            <div>
              {copy.howItWorks.steps.map((step, index) => (
                <article
                  key={step.title}
                  ref={(node) => {
                    stepRefs.current[index] = node
                  }}
                  className="flex min-h-[85vh] flex-col justify-center py-16"
                  aria-current={activeIndex === index ? 'true' : undefined}
                >
                  <h3 className="font-heading text-[40px] leading-[1.1] tracking-[-0.48px] text-text-cream md:text-heading">
                    {step.title}
                  </h3>
                  <p
                    className={`mt-4 max-w-[440px] font-heading text-lead font-light transition-colors duration-300 min-[1800px]:max-w-[520px] ${
                      activeIndex === index ? 'text-text-muted' : 'text-text-tertiary'
                    }`}
                  >
                    {step.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="relative">
              <div className="sticky top-[96px] flex h-[calc(100vh-120px)] items-center min-[1800px]:h-[calc(100vh-96px)]">
                <div className="relative aspect-[640/686] w-full overflow-hidden rounded-panel bg-frame">
                  {panels.map((panel, index) => (
                    <div
                      key={panel.label}
                      className={`absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        activeIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'
                      }`}
                      aria-hidden={activeIndex !== index}
                    >
                      <VideoSlot
                        src={panel.src}
                        poster={panel.poster}
                        finalPoster={panel.poster}
                        width={panel.width}
                        height={panel.height}
                        ariaLabel={panel.label}
                        loop
                        active={activeIndex === index}
                        className="h-full w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-12 md:mt-12 md:gap-16">
            {copy.howItWorks.steps.map((step, index) => {
              const panel = panels[index]
              return (
                <div key={step.title} className="flex flex-col gap-6">
                  {panel ? (
                    <VideoSlot
                      src={panel.src}
                      poster={panel.poster}
                      finalPoster={panel.poster}
                      width={panel.width}
                      height={panel.height}
                      ariaLabel={panel.label}
                      loop
                      className="overflow-hidden rounded-[20px] bg-frame md:rounded-panel"
                    />
                  ) : null}
                  <div>
                    <h3 className="font-heading text-[32px] leading-[1.1] tracking-[-0.48px] text-text-cream sm:text-[40px]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[440px] font-heading text-[18px] leading-snug font-light text-text-muted sm:mt-4 sm:text-lead">
                      {step.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Container>
    </section>
  )
}
