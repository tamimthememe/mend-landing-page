import { useRef } from 'react'
import { copy } from '../content/copy.ts'
import { EmailCapture } from '../components/ui/EmailCapture.tsx'
import { useSectionView } from '../lib/useSectionView.ts'
import mendboardsWordmark from '../assets/images/mendboards-wordmark.png'
import mendboardsBg from '../assets/images/mendboards/bg.png'

/** Figma canvas size — keep the bg PNG at this size so resize only clips, never reflows. */
const BG_WIDTH = 1440
const BG_HEIGHT = 900

export function MendboardsBanner() {
  const sectionRef = useRef<HTMLElement>(null)
  useSectionView('mendboards', sectionRef)

  return (
    <section
      id="mendboards"
      ref={sectionRef}
      aria-labelledby="mendboards-heading"
      className="relative flex min-h-[100vh] flex-col overflow-hidden bg-surface"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={mendboardsBg}
          alt=""
          width={BG_WIDTH}
          height={BG_HEIGHT}
          decoding="async"
          className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `max(100%, ${BG_WIDTH}px)`,
            minHeight: '100vh',
            height: 'auto',
            aspectRatio: `${BG_WIDTH} / ${BG_HEIGHT}`,
            objectFit: 'cover',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[791px] flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:gap-8 md:px-12 xl:gap-8 xl:px-0">
        <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-4">
            <img
              src={mendboardsWordmark}
              alt={copy.mendboards.wordmark}
              width={489}
              height={62}
              className="h-auto w-[min(100%,320px)] object-contain sm:h-[62px] sm:w-[min(100%,489px)]"
            />
            <h2
              id="mendboards-heading"
              className="max-w-[791px] font-heading text-[18px] leading-snug font-light tracking-[-0.48px] text-text-muted sm:text-[22px] md:text-subhead md:leading-[50.4px]"
            >
              {copy.mendboards.line}
            </h2>
          </div>

          <div className="flex w-full max-w-[723px] flex-col items-center gap-2.5">
            <p className="font-heading text-[18px] leading-snug font-light tracking-[-0.48px] text-text-muted sm:text-lead">
              {copy.mendboards.prompt}
            </p>
            <EmailCapture
              id="mendboards-email"
              list="mendboards"
              source="mendboards"
              placeholder={copy.mendboards.emailPlaceholder}
              buttonLabel={copy.mendboards.button}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
