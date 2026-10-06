/**
 * Scaffold for the hero highlight sequencer. Not wired until the Hero section is built.
 * The cursor is an HTML element animated from "motion/react".
 * Each product component is a LottieSlot; the sequencer calls play() when the cursor arrives.
 */

/** Default ease. Never linear. */
export const motionEase = [0.22, 1, 0.36, 1] as const

/** Snaps use a spring with a slight overshoot. */
export const snapSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
} as const

/** Idle opacity for hero widgets; active turn rises to 1. */
export const heroDimOpacity = 0.6

/** Fixes start this long after the cursor click-dip. */
export const heroFixDelayMs = 100

/** The whole sequence stays under this. */
export const heroSequenceMaxMs = 10_000

/** Button and toggle, from the motion spec. */
export const heroSmallComponentMs = { min: 600, max: 800 } as const

/** User card cascade, from the motion spec. */
export const heroUserCardMs = 2300
