/**
 * Every user-facing string on the page.
 * Locked strings are verbatim from the project rules. If Figma disagrees, this file wins.
 */
export const copy = {
  nav: {
    wordmark: 'mend',
    links: [
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Figma vs Build', href: '#figma-vs-build' },
      { label: 'Mendboards', href: '#mendboards' },
    ],
    button: 'Join the waitlist',
  },
  hero: {
    headline: "Don't just build it. Mend it.",
    subline: 'Automatically catch your UI bugs before your users do.',
    offer: 'Get Early Access to Mend + a free UI audit.*',
    footnote: '*Free UI audit available to the first 50 only.',
    emailPlaceholder: 'you@company.com',
    button: 'Join the waitlist',
  },
  howItWorks: {
    headline: 'Every flaw, found and fixed.',
    steps: [
      {
        title: 'Scan.',
        body: "No more checking every screen by hand, Mend crawls your whole app and finds what's off.",
      },
      {
        title: 'Audit.',
        body: 'Review them your way, a table to triage fast, or one card at a time, each with the fix ready.',
      },
      {
        title: 'Ship.',
        body: 'Work through them, verify, and ship your UI complete.',
      },
    ],
  },
  figmaVsBuild: {
    headline: 'Figma on one side. Reality on the other.',
    body: 'What ships should match what you designed. Mend makes sure it does.',
  },
  mendboards: {
    wordmark: 'mendboards',
    line: 'Your whole product, mapped and audited in one canvas.',
    prompt: 'Be first to try Mendboards',
    emailPlaceholder: 'you@company.com',
    button: 'Get it Early',
  },
  founder: {
    heading: "Why I'm building Mend",
    quote:
      "I've watched too many designers get torn apart publicly for flaws a tool should've caught in seconds. So I'm building Mend, automated design QA that catches every UI issue before anyone else does.",
    name: 'Tamim Rizvi',
    title: 'Founder, Mend',
  },
  finalCta: {
    headline: "Don't let the next flaw be the one they see.",
    subline: 'Ship complete, every time, with automated design QA.',
    button: 'Join the waitlist',
    note: 'Free UI audit for the first 50.',
    emailPlaceholder: 'you@company.com',
  },
  footer: {
    platform: {
      label: 'PLATFORM',
      links: [
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Design vs. build', href: '#figma-vs-build' },
        { label: 'Mendboards', href: '#mendboards' },
        { label: 'Join the waitlist', href: '#waitlist' },
      ],
    },
    company: {
      label: 'COMPANY',
      links: [
        { label: "Why I'm building Mend", href: '#why-mend' },
        { label: 'Contact', href: 'mailto:admin@mendit.net' },
      ],
    },
    /**
     * TODO: social profile URLs.
     * The href "TODO" is not a link. Footer renders these as inert text until they are set.
     */
    connect: {
      label: 'CONNECT',
      links: [
        { label: 'LinkedIn', href: 'TODO' },
        { label: 'X/Twitter', href: 'TODO' },
        { label: 'Email', href: 'TODO' },
      ],
    },
    legal: {
      label: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
    wordmark: 'mend',
    copyright: '© 2026 Mend. All rights reserved.',
  },
  /**
   * Waitlist UI strings.
   * `success` and `invalidEmail` are specified verbatim.
   */
  emailCapture: {
    success: "You're on the list.",
    viewPass: 'View your pass',
    invalidEmail: 'Enter a valid email, like you@company.com.',
    networkError: "Couldn't reach the server. Check your connection and try again.",
    unknownError: 'Something went wrong on our side. Try again in a moment.',
  },
  ticket: {
    dialogLabel: "You're on the Mend waitlist",
    alreadyLine: "You're already on the list. Here's your pass again.",
    eyebrow: 'WELCOME TO MEND',
    stub: "YOU'RE IN",
    shareLinkedIn: 'Share on LinkedIn',
    copyLink: 'Copy link',
    linkCopied: 'Link copied',
    done: 'Done',
    main: {
      hero: 'EARLY ACCESS',
      bottomLines: ["You're one of the first 500.", 'First 50 get a free UI audit.'],
    },
    mendboards: {
      hero: 'MENDBOARDS',
      bottomLines: ["You'll be first to try Mendboards."],
    },
  },
} as const

export type Copy = typeof copy
