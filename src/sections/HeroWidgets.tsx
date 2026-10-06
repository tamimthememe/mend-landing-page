import { HeroLottie } from '../components/motion/HeroLottie.tsx'

export function HeroButton() {
  return (
    <HeroLottie
      id="top-right"
      src="/lottie/top-right.lottie"
      ariaLabel="Animated button component being fixed by Mend"
    />
  )
}

export function HeroToggle() {
  return (
    <HeroLottie
      id="center-left"
      src="/lottie/center-left.lottie"
      ariaLabel="Animated toggle switch being fixed by Mend"
    />
  )
}

export function HeroChart() {
  return (
    <HeroLottie
      id="bottom-left"
      src="/lottie/bottom-left.lottie"
      ariaLabel="Animated chart card being fixed by Mend"
    />
  )
}

export function HeroPayment() {
  return (
    <HeroLottie
      id="bottom-right"
      src="/lottie/bottom-right.lottie"
      ariaLabel="Animated payment screen being fixed by Mend"
    />
  )
}
