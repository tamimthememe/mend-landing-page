export type MotionColor = { r: number; g: number; b: number; a: number }

type Bezier = { p1x: number; p1y: number; p2x: number; p2y: number }

type Easing = {
  hold?: boolean
  bezierValues?: Bezier
}

type Keyframe = {
  timeMs: number
  value: number | MotionColor
  easingToNext?: Easing
}

type MotionField = {
  field: string
  keyframes: Keyframe[]
}

type MotionNode = {
  node: string
  timelineDurationMs: number
  fields: MotionField[]
}

export type FigmaMotionFile = {
  version: number
  playbackStyle: string
  nodes: MotionNode[]
}

export type NodePose = {
  x?: number
  y?: number
  baseX?: number
  baseY?: number
  scaleX?: number
  scaleY?: number
  opacity?: number
  width?: number
  height?: number
  rotation?: number
  radiusTopRight?: number
  fill?: string
  stroke?: string
}

function isColor(value: number | MotionColor): value is MotionColor {
  return typeof value === 'object'
}

function bezierY(curve: Bezier, amount: number): number {
  if (amount <= 0) return 0
  if (amount >= 1) return 1
  const { p1x, p1y, p2x, p2y } = curve
  let t = amount
  for (let step = 0; step < 8; step += 1) {
    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx
    const x = ((ax * t + bx) * t + cx) * t
    const dx = (3 * ax * t + 2 * bx) * t + cx
    if (Math.abs(dx) < 1e-6) break
    t = Math.min(1, Math.max(0, t - (x - amount) / dx))
  }
  const cy = 3 * p1y
  const by = 3 * (p2y - p1y) - cy
  const ay = 1 - cy - by
  return ((ay * t + by) * t + cy) * t
}

function mix(start: number, end: number, amount: number): number {
  return start + (end - start) * amount
}

function cssColor(color: MotionColor): string {
  const red = Math.round(color.r * 255)
  const green = Math.round(color.g * 255)
  const blue = Math.round(color.b * 255)
  return `rgba(${red}, ${green}, ${blue}, ${color.a})`
}

function sampleValue(keyframes: Keyframe[], timeMs: number): number | MotionColor {
  const first = keyframes[0]
  if (!first || timeMs <= first.timeMs) return first?.value ?? 0
  const last = keyframes[keyframes.length - 1]
  if (!last || timeMs >= last.timeMs) return last?.value ?? 0

  let index = 0
  for (let cursor = 0; cursor < keyframes.length - 1; cursor += 1) {
    const next = keyframes[cursor + 1]
    if (next && next.timeMs <= timeMs) index = cursor + 1
    else break
  }

  const current = keyframes[index]
  const next = keyframes[index + 1]
  if (!current || !next) return last.value
  if (current.easingToNext?.hold) return current.value

  const span = next.timeMs - current.timeMs
  const linear = span === 0 ? 1 : (timeMs - current.timeMs) / span
  const curve = current.easingToNext?.bezierValues
  const amount = curve ? bezierY(curve, linear) : linear

  if (isColor(current.value) && isColor(next.value)) {
    return {
      r: mix(current.value.r, next.value.r, amount),
      g: mix(current.value.g, next.value.g, amount),
      b: mix(current.value.b, next.value.b, amount),
      a: mix(current.value.a, next.value.a, amount),
    }
  }
  if (typeof current.value === 'number' && typeof next.value === 'number') {
    return mix(current.value, next.value, amount)
  }
  return next.value
}

function fieldName(field: string): string {
  return field.split('@')[0] ?? field
}

function firstNumber(keyframes: Keyframe[]): number | undefined {
  const value = keyframes[0]?.value
  return typeof value === 'number' ? value : undefined
}

export function motionDuration(file: FigmaMotionFile): number {
  return file.nodes.reduce((longest, node) => Math.max(longest, node.timelineDurationMs), 0)
}

export function sampleMotion(file: FigmaMotionFile, timeMs: number): Map<string, NodePose> {
  const poses = new Map<string, NodePose>()
  for (const node of file.nodes) {
    const pose: NodePose = {}
    for (const field of node.fields) {
      const name = fieldName(field.field)
      const value = sampleValue(field.keyframes, timeMs)
      if (name === 'motionTranslationX' && typeof value === 'number') {
        pose.x = value
        pose.baseX = firstNumber(field.keyframes)
      } else if (name === 'motionTranslationY' && typeof value === 'number') {
        pose.y = value
        pose.baseY = firstNumber(field.keyframes)
      } else if (name === 'motionScaleX' && typeof value === 'number') {
        pose.scaleX = value
      } else if (name === 'motionScaleY' && typeof value === 'number') {
        pose.scaleY = value
      } else if (name === 'opacity' && typeof value === 'number') {
        pose.opacity = value
      } else if (name === 'width' && typeof value === 'number') {
        pose.width = value
      } else if (name === 'height' && typeof value === 'number') {
        pose.height = value
      } else if (name === 'motionRotation' && typeof value === 'number') {
        pose.rotation = value
      } else if (name === 'rectangleTopRightCornerRadius' && typeof value === 'number') {
        pose.radiusTopRight = value
      } else if (name === 'fill[0].color' && isColor(value)) {
        pose.fill = cssColor(value)
      } else if (name === 'stroke[0].color' && isColor(value)) {
        pose.stroke = cssColor(value)
      }
    }
    poses.set(node.node, pose)
  }
  return poses
}

export function applyMotionPose(element: HTMLElement, pose: NodePose) {
  const transforms: string[] = []
  if (pose.x != null && pose.baseX != null) transforms.push(`translateX(${pose.x - pose.baseX}px)`)
  if (pose.y != null && pose.baseY != null) transforms.push(`translateY(${pose.y - pose.baseY}px)`)
  if (pose.scaleX != null || pose.scaleY != null) {
    transforms.push(`scale(${pose.scaleX ?? 1}, ${pose.scaleY ?? 1})`)
  }
  if (pose.rotation != null) {
    const degrees = (-pose.rotation * 180) / Math.PI
    transforms.push(`rotate(${degrees}deg)`)
  }
  element.style.transform = transforms.join(' ')
  if (pose.opacity != null) element.style.opacity = String(pose.opacity / 100)
  if (pose.width != null) {
    element.style.width = `${pose.width}px`
    element.style.right = 'auto'
  }
  if (pose.height != null) {
    element.style.height = `${pose.height}px`
    element.style.bottom = 'auto'
  }
  if (pose.fill) {
    if (element.dataset.motionPaint === 'text') element.style.color = pose.fill
    else element.style.backgroundColor = pose.fill
  }
  if (pose.radiusTopRight != null) {
    element.style.borderTopRightRadius = `${pose.radiusTopRight}px`
  }
  if (pose.stroke) {
    if (element.dataset.motionPaint === 'stroke') element.style.stroke = pose.stroke
    else element.style.borderColor = pose.stroke
  }
}
