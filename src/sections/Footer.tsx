import { copy } from '../content/copy.ts'
import wordmark from '../assets/icons/wordmark.svg'
import { track } from '../lib/analytics.ts'

const columns = [
  copy.footer.platform,
  copy.footer.company,
  copy.footer.connect,
  copy.footer.legal,
] as const

export function Footer() {
  return (
    <footer className="bg-surface px-4 pt-8 pb-4 md:px-12 xl:px-[82px]">
      <nav
        aria-label="Footer"
        className="mx-auto grid w-full max-w-[1264px] grid-cols-2 gap-x-6 gap-y-10 xl:grid-cols-4 xl:gap-10"
      >
        {columns.map((column) => (
          <div key={column.label}>
            <h2 className="font-heading text-[12px] leading-[14.4px] tracking-[0.12px] text-footer-label uppercase">
              {column.label}
            </h2>
            <ul className="mt-4 border-l border-footer-rule pl-3.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href === 'TODO' ? (
                    <span className="font-heading text-[16px] leading-[1.4] tracking-[-0.24px] text-text-cream sm:text-[20px] xl:text-lead">
                      {link.label}
                    </span>
                  ) : (
                    <a
                      href={link.href}
                      className="font-heading text-[16px] leading-[1.4] tracking-[-0.24px] text-text-cream opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 active:opacity-100 sm:text-[20px] xl:text-lead"
                      {...(link.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      onClick={() => {
                        if (link.href.startsWith('#')) {
                          track('nav_clicked', { target: link.href })
                        }
                      }}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <img
        src={wordmark}
        alt={copy.footer.wordmark}
        width={1263}
        height={362}
        loading="lazy"
        className="mx-auto mt-10 h-auto w-full max-w-[1263px] xl:mt-16"
      />
      <p className="mt-6 text-center font-heading text-fine font-medium text-text-tertiary xl:mt-8">
        {copy.footer.copyright}
      </p>
    </footer>
  )
}
