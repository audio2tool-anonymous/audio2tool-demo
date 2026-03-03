import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { PlayerArea } from './components/PlayerArea'
import { FiguresSection } from './components/FiguresSection'
import { TIER_CONFIGS } from './types'
import { Mic, BarChart3 } from 'lucide-react'

const ABSTRACT = `
  Audio2Tool evaluates spoken language understanding for in-car and assistant tool use.
  The benchmark is organized into eight complexity tiers, from direct single-intent
  commands through parametric slot-filling, multi-intent coordination, implicit inference,
  long-context filtering, mid-utterance correction, multi-turn conversation, and
  intent blending. This demo lets you explore representative samples and ground-truth
  tool calls for each tier, plus key results and figures from the paper.
`.trim().replace(/\s+/g, ' ')

type View = 'benchmark' | 'figures'

export default function App() {
  const [selectedTierId, setSelectedTierId] = useState(1)
  const [view, setView] = useState<View>('benchmark')
  const selectedTier = TIER_CONFIGS.find((t) => t.id === selectedTierId) ?? TIER_CONFIGS[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-zinc-200">
      <header className="shrink-0 border-b border-border bg-gradient-to-b from-surface to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Audio2Tool</h1>
          <p className="text-sm text-accent font-medium mt-1 tracking-wide uppercase">
            Speak, Call, Act — Benchmark Demo
          </p>
          <p className="mt-4 text-sm text-zinc-400 max-w-3xl leading-relaxed">{ABSTRACT}</p>
          <nav className="mt-6 flex gap-1 rounded-lg bg-surface-muted p-1 w-fit">
            <button
              type="button"
              onClick={() => setView('benchmark')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${view === 'benchmark' ? 'bg-surface-elevated text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Mic className="h-4 w-4" />
              Benchmark
            </button>
            <button
              type="button"
              onClick={() => setView('figures')}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${view === 'figures' ? 'bg-surface-elevated text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Results & Figures
            </button>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {view === 'benchmark' && (
          <Sidebar
            tiers={TIER_CONFIGS}
            selectedTierId={selectedTierId}
            onSelectTier={setSelectedTierId}
          />
        )}
        <main className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {view === 'benchmark' && (
              <>
                <div className="mb-8">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">
                    Tier {selectedTier.id}
                  </span>
                  <h2 className="text-xl font-semibold text-white mt-1">{selectedTier.name}</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">{selectedTier.subtitle}</p>
                  <p className="text-xs text-zinc-600 mt-2">
                    Key challenge: {selectedTier.challenge}
                  </p>
                </div>
                <PlayerArea tier={selectedTier} />
              </>
            )}
            {view === 'figures' && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Results & Figures</h2>
                <p className="text-sm text-zinc-500 mb-6">
                  Interactive figures from the Audio2Tool paper. Click any figure to expand.
                </p>
                <FiguresSection />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
