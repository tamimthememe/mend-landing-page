import { StrictMode, useState, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { HeroButton, HeroChart, HeroPayment, HeroToggle } from './sections/HeroWidgets.tsx'
import { HeroUserCard } from './sections/HeroUserCard.tsx'
import './index.css'

const clips: { file: string; width: number; height: number; Widget: ComponentType }[] = [
  { file: 'top-left.lottie', width: 1038, height: 708, Widget: HeroUserCard },
  { file: 'top-right.lottie', width: 1416, height: 904, Widget: HeroButton },
  { file: 'center-left.lottie', width: 1463, height: 728, Widget: HeroToggle },
  { file: 'bottom-left.lottie', width: 1897, height: 1239, Widget: HeroChart },
  { file: 'bottom-right.lottie', width: 1084, height: 1364, Widget: HeroPayment },
]

function Animations() {
  const [run, setRun] = useState(0)

  return (
    <main className="min-h-screen bg-bg px-8 py-10">
      <div className="mb-12 flex items-center gap-6">
        <h1 className="font-heading text-lead font-medium">Hero animations</h1>
        <button
          type="button"
          className="rounded-pill bg-frame px-4 py-2 font-heading text-small font-medium text-text"
          onClick={() => setRun((value) => value + 1)}
        >
          Replay
        </button>
      </div>
      <ul className="flex flex-col gap-16">
        {clips.map(({ file, width, height, Widget }) => (
          <li key={file} className="flex flex-col gap-4">
            <p className="font-heading text-small text-text-muted">
              {file} · {width}×{height}
            </p>
            <div className="max-w-full overflow-auto">
              <div style={{ width: Math.min(width, 720), aspectRatio: `${width} / ${height}` }}>
                <Widget key={run} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root is missing.')

createRoot(root).render(
  <StrictMode>
    <Animations />
  </StrictMode>,
)
