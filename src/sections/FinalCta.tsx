import { copy } from '../content/copy.ts'
import { Container } from '../components/ui/Container.tsx'
import { EmailCapture } from '../components/ui/EmailCapture.tsx'
import { StarsBackground } from '../components/ui/stars.tsx'
import { useSectionView } from '../lib/useSectionView.ts'

export function FinalCta() {
  const sectionRef = useSectionView('waitlist')

  return (
    <section
      id="waitlist"
      ref={sectionRef}
      aria-labelledby="waitlist-heading"
      className="relative h-svh min-h-[100vh]"
    >
      <StarsBackground
        className="absolute inset-0 size-full"
        speed={50}
        factor={0.05}
        starColor="#ffffff"
        transition={{ stiffness: 50, damping: 20 }}
      >
        <Container className="relative z-10 flex h-full min-h-[100vh] flex-col items-center justify-center gap-8 text-center xl:gap-16">
          <div className="flex max-w-[610px] flex-col items-center gap-4 xl:gap-6">
            <h2
              id="waitlist-heading"
              className="font-heading text-[28px] leading-[1.15] tracking-[-0.48px] text-text sm:text-[32px] md:text-heading"
            >
              {copy.finalCta.headline}
            </h2>
            <p className="font-heading text-[18px] leading-snug font-light text-text-tertiary sm:text-lead">
              {copy.finalCta.subline}
            </p>
          </div>
          <div className="flex w-full max-w-[808px] flex-col items-center gap-2.5">
            <EmailCapture
              id="final-cta-email"
              list="main"
              source="final-cta"
              placeholder={copy.finalCta.emailPlaceholder}
              buttonLabel={copy.finalCta.button}
              className="w-full"
            />
            <p className="font-heading text-small font-medium text-text-tertiary">{copy.finalCta.note}</p>
          </div>
        </Container>
      </StarsBackground>
    </section>
  )
}
