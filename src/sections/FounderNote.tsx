import { copy } from '../content/copy.ts'
import { Container } from '../components/ui/Container.tsx'
import founderPhoto from '../assets/images/founder.png'
import { useSectionView } from '../lib/useSectionView.ts'

export function FounderNote() {
  const sectionRef = useSectionView('why-mend')

  return (
    <section
      id="why-mend"
      ref={sectionRef}
      aria-labelledby="why-mend-heading"
      className="bg-surface py-10 xl:py-16"
    >
      <Container className="flex flex-col items-center gap-6 text-center xl:gap-16">
        <h2
          id="why-mend-heading"
          className="max-w-[591px] font-heading text-[28px] leading-[1.15] tracking-[-0.48px] text-text sm:text-[32px] md:text-heading"
        >
          {copy.founder.heading}
        </h2>
        <blockquote className="max-w-[70ch] min-[1800px]:max-w-[92ch]">
          <p className="font-heading text-[18px] leading-snug font-light tracking-[-0.48px] text-text sm:text-[22px] md:text-[32px] md:leading-[1.35]">
            “{copy.founder.quote}”
          </p>
        </blockquote>
        <div className="flex items-center gap-3 text-left sm:gap-4">
          <img
            src={founderPhoto}
            alt={`${copy.founder.name}, ${copy.founder.title}`}
            width={72}
            height={72}
            loading="lazy"
            className="size-11 rounded-pill border-[1.8px] border-border object-cover sm:size-[72px]"
          />
          <div>
            <p className="font-heading text-[18px] tracking-[-0.48px] text-text sm:text-[28px]">
              {copy.founder.name}
            </p>
            <p className="font-heading text-[14px] tracking-[-0.48px] text-text-muted sm:text-body">
              {copy.founder.title}
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
