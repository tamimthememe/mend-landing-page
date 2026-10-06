type LottieAsset = {
  u?: string
  p?: string
  e?: number
}

type LottieFile = {
  assets?: LottieAsset[]
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

async function inflate(compressed: Uint8Array): Promise<Uint8Array> {
  const bytes = new Uint8Array(compressed)
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function unzip(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const files = new Map<string, Uint8Array>()
  let offset = 0

  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const method = view.getUint16(offset + 8, true)
    const compressedSize = view.getUint32(offset + 18, true)
    const nameLength = view.getUint16(offset + 26, true)
    const extraLength = view.getUint16(offset + 28, true)
    const nameStart = offset + 30
    const name = new TextDecoder().decode(bytes.subarray(nameStart, nameStart + nameLength))
    const dataStart = nameStart + nameLength + extraLength
    const compressed = bytes.subarray(dataStart, dataStart + compressedSize)
    const data = method === 0 ? compressed : await inflate(compressed)
    files.set(name, data)
    offset = dataStart + compressedSize
  }

  return files
}

/** Reads a .lottie archive and returns animation JSON with images inlined. */
export async function loadDotLottie(src: string, signal: AbortSignal): Promise<object> {
  const response = await fetch(src, { signal })
  if (!response.ok) throw new Error(`Failed to load ${src}`)
  const files = await unzip(new Uint8Array(await response.arrayBuffer()))
  const animationName = [...files.keys()].find(
    (name) => name.startsWith('animations/') && name.endsWith('.json'),
  )
  const animationBytes = animationName ? files.get(animationName) : undefined
  if (!animationBytes) throw new Error(`No animation found in ${src}`)

  const animation = JSON.parse(new TextDecoder().decode(animationBytes)) as LottieFile
  for (const asset of animation.assets ?? []) {
    if (!asset.p) continue
    const imageName = [...files.keys()].find((name) => name.endsWith(`/${asset.p}`) || name === asset.p)
    const image = imageName ? files.get(imageName) : undefined
    if (!image) continue
    asset.u = ''
    asset.p = `data:image/png;base64,${toBase64(image)}`
    asset.e = 1
  }
  return animation
}
