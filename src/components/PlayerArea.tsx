import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Shuffle, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { Sample, TierMetadata, TierConfig } from '../types'
import { fetchRandomSampleForTier } from '../lib/fetchMetadata'

interface PlayerAreaProps {
  tier: TierConfig
  onError?: (message: string) => void
}

function getAudioUrl(tierSlug: string, audioFile: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const path = base.endsWith('/') ? base : `${base}/`
  return `${path}audio/${tierSlug}/${audioFile}`
}

export function PlayerArea({ tier, onError }: PlayerAreaProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [metadata, setMetadata] = useState<TierMetadata | null>(null)
  const [sample, setSample] = useState<Sample | null>(null)
  const [loading, setLoading] = useState(true)
  const [reveal, setReveal] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadSample = async () => {
    setLoading(true)
    setLoadError(null)
    setReveal(false)
    try {
      const { metadata: meta, sample: s } = await fetchRandomSampleForTier(tier.slug)
      setMetadata(meta)
      setSample(s)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load tier data'
      setLoadError(msg)
      onError?.(msg)
      setMetadata(null)
      setSample(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSample()
  }, [tier.slug])

  useEffect(() => {
    if (!waveformRef.current || !sample?.audio_file) return

    const url = getAudioUrl(tier.slug, sample.audio_file)
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#3b82f6',
      progressColor: '#60a5fa',
      cursorColor: '#93c5fd',
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 80,
      normalize: true,
      url,
    })

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [tier.slug, sample?.audio_file])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading tier data…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
        <p className="font-medium">Could not load tier</p>
        <p className="text-sm mt-1">{loadError}</p>
        <p className="text-xs mt-2 text-zinc-500">
          Ensure <code className="bg-surface-muted px-1 rounded">/audio/{tier.slug}/metadata.json</code> exists and the dev server or GitHub Pages is serving the <code className="bg-surface-muted px-1 rounded">public/</code> folder.
        </p>
      </div>
    )
  }

  if (!sample) {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-4 text-zinc-400">
        <p>No samples in metadata for this tier.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={loadSample}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
        >
          <Shuffle className="h-4 w-4" />
          Randomize
        </button>
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-surface-muted transition-colors"
        >
          {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {reveal ? 'Hide' : 'Reveal'} Ground Truth
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1">Transcript</p>
        <p className="text-zinc-200 rounded-lg bg-surface-muted p-3 border border-border">
          &ldquo;{sample.transcript}&rdquo;
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-400 mb-2">Waveform</p>
        <div
          ref={waveformRef}
          className="rounded-lg bg-surface-muted border border-border overflow-hidden min-h-[80px]"
        />
      </div>

      {reveal && (
        <div className="space-y-4 rounded-lg border border-border bg-surface-muted p-4">
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Ground Truth Tool Call(s)</p>
            <pre className="text-sm text-emerald-300/90 bg-black/30 p-3 rounded overflow-x-auto font-mono">
              {JSON.stringify(sample.ground_truth.tool_calls, null, 2)}
            </pre>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Reasoning</p>
            <p className="text-sm text-zinc-300">{sample.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  )
}
