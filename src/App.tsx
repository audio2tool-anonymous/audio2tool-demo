import { useState, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { PlayerArea } from './components/PlayerArea'
import { FiguresSection } from './components/FiguresSection'
import { TaxonomySection } from './components/TaxonomySection'
import { TIER_CONFIGS } from './types'

const ABSTRACT = `Voice assistants increasingly rely on SpeechLMs to interpret spoken queries and execute complex tasks, yet existing benchmarks lack domain breadth, acoustic diversity, and compositional reasoning complexity to evaluate tool-calling performance. We introduce Audio2Tool, a large-scale dataset comprising ~30,000 queries designed to assess tool-calling capabilities of SpeechLMs across three primary domains: Smart Car, Smart Home, and Wearables. Our benchmark features a multi-tier complexity hierarchy, ranging from simple direct commands to complex multi-intent and needle-in-a-haystack extraction to isolate distinct failure modes. To ensure realism, we employ zero-shot voice cloning TTS and diverse noise profiles to simulate in-the-wild conditions. We will release the dataset and benchmark upon acceptance.`

const AUTHORS = 'Anonymous Authors'
const CONFERENCE = 'Interspeech 2026'

export default function App() {
  const [selectedTierId, setSelectedTierId] = useState(1)
  const datasetSectionRef = useRef<HTMLElement>(null)
  const selectedTier = TIER_CONFIGS.find((t) => t.id === selectedTierId) ?? TIER_CONFIGS[0]

  const scrollToDataset = () => {
    datasetSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white text-zinc-800">
      {/* Sticky nav — CVPR/ECCV style */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <a href="#" className="text-xl font-bold text-zinc-900 tracking-tight hover:text-zinc-700">
            Audio2Tool
          </a>
          <nav className="flex items-center gap-6">
            <a href="#overview" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Overview
            </a>
            <button
              type="button"
              onClick={scrollToDataset}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Dataset
            </button>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              aria-label="Paper"
            >
              Paper
            </a>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              aria-label="Code"
            >
              Code
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            Audio2Tool
          </h1>
          <p className="mt-2 text-lg text-zinc-600">
            Speak, Call, Act — A Dataset for Benchmarking Speech Tool Use
          </p>
          <p className="mt-4 text-sm text-zinc-500">
            {AUTHORS}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-700">
            {CONFERENCE}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Paper
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Code
            </a>
            <button
              type="button"
              onClick={scrollToDataset}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Dataset & Samples
            </button>
          </div>
        </section>

        {/* Overview: Abstract + Figures + Taxonomy */}
        <section id="overview" className="border-t border-zinc-100 bg-zinc-50/50">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Abstract</h2>
            <p className="text-zinc-700 leading-relaxed max-w-3xl">
              {ABSTRACT}
            </p>
          </div>

          <div className="max-w-4xl mx-auto px-6 pb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Key Results</h2>
            <FiguresSection />
          </div>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Tool Taxonomy</h2>
            <TaxonomySection />
          </div>
        </section>

        {/* Dataset: tier samples (current benchmark UI) */}
        <section
          id="dataset"
          ref={datasetSectionRef}
          className="border-t border-zinc-200 bg-white min-h-[80vh]"
        >
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Dataset & Samples</h2>
            <p className="text-zinc-600 mb-8 max-w-2xl">
              Explore representative audio samples and ground-truth tool calls for each complexity tier. Select a tier and play samples with transcripts.
            </p>
          </div>
          <div className="flex border-t border-zinc-200">
            <Sidebar
              tiers={TIER_CONFIGS}
              selectedTierId={selectedTierId}
              onSelectTier={setSelectedTierId}
            />
            <div className="flex-1 min-w-0">
              <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="mb-6">
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                    Tier {selectedTier.id}
                  </span>
                  <h3 className="text-xl font-semibold text-zinc-900 mt-1">{selectedTier.name}</h3>
                  <p className="text-sm text-zinc-600 mt-0.5">{selectedTier.subtitle}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Key challenge: {selectedTier.challenge}
                  </p>
                </div>
                <PlayerArea tier={selectedTier} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
          <p>Audio2Tool — Benchmark for Speech Tool Use. {CONFERENCE}.</p>
        </footer>
      </main>
    </div>
  )
}
