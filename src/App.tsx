import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { PlayerArea } from './components/PlayerArea'
import { TIER_CONFIGS } from './types'

const ABSTRACT = `
  Audio2Tool evaluates spoken language understanding for in-car and assistant tool use.
  The benchmark is organized into eight complexity tiers, from direct single-intent
  commands (Tier 1) through parametric slot-filling (Tier 2), multi-intent coordination
  (Tier 3), implicit and pragmatic inference (Tier 4), long-context "needle" filtering
  (Tier 5), mid-utterance correction (Tier 6), multi-turn conversation (Tier 7), and
  intent blending with speaker focus (Tier 8). This demo lets you explore representative
  samples and ground-truth tool calls for each tier.
`.trim().replace(/\s+/g, ' ')

export default function App() {
  const [selectedTierId, setSelectedTierId] = useState(1)
  const selectedTier = TIER_CONFIGS.find((t) => t.id === selectedTierId) ?? TIER_CONFIGS[0]

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-zinc-200">
      <header className="shrink-0 border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Audio2Tool: Benchmark Demo
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-3xl leading-relaxed">
            {ABSTRACT}
          </p>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <Sidebar
          tiers={TIER_CONFIGS}
          selectedTierId={selectedTierId}
          onSelectTier={setSelectedTierId}
        />
        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                Tier {selectedTier.id}: {selectedTier.name}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">{selectedTier.subtitle}</p>
              <p className="text-xs text-zinc-600 mt-1">
                Key challenge: {selectedTier.challenge}
              </p>
            </div>
            <PlayerArea tier={selectedTier} />
          </div>
        </main>
      </div>
    </div>
  )
}
