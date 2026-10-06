import { copy } from '../content/copy.ts'
import { Container } from '../components/ui/Container.tsx'
import { ComparisonSlider } from '../components/ui/ComparisonSlider.tsx'
import { useSectionView } from '../lib/useSectionView.ts'
import figmaSs from '../assets/images/figma-ss.png'
import liveSs from '../assets/images/live-ss.png'

export function FigmaVsBuild() {
  const sectionRef = useSectionView('figma-vs-build')

  return (
    <section
      id="figma-vs-build"
      ref={sectionRef}
      aria-labelledby="figma-vs-build-heading"
      className="bg-bg"
    >
      <Container className="flex flex-col items-center gap-8 xl:gap-12">
        <h2
          id="figma-vs-build-heading"
          className="max-w-[591px] text-center font-heading text-[28px] leading-[1.15] tracking-[-0.48px] text-text sm:text-[32px] md:text-heading md:leading-[50.4px]"
        >
          {copy.figmaVsBuild.headline.split('. ').map((line, index, lines) => (
            <span key={line}>
              {index === 0 ? `${line}.` : line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>

        <div className="flex w-full flex-col items-center gap-4 xl:gap-6">
          <ComparisonSlider
            designSrc={figmaSs}
            buildSrc={liveSs}
            designAlt="Figma design of the Food app audit screen"
            buildAlt="Live build of the Food app audit screen"
            width={1776}
            height={936}
            className="w-full"
          />

          <p className="max-w-[70ch] text-center font-heading text-[18px] leading-snug font-light text-text sm:text-lead">
            {copy.figmaVsBuild.body}
          </p>
        </div>
      </Container>
    </section>
  )
}
