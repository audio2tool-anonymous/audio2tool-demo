import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Loader2 } from 'lucide-react'
import type { Sample, TierConfig } from '../types'
import { fetchSamplesForTier } from '../lib/fetchMetadata'

interface PlayerAreaProps {
  tier: TierConfig
  onError?: (message: string) => void
}

function getAudioUrl(tierSlug: string, audioFile: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const path = base.endsWith('/') ? base : `${base}/`
  return `${path}audio/${tierSlug}/${audioFile}`
}

interface SampleCardProps {
  sample: Sample
  tierSlug: string
  onPlayRequest: (ws: WaveSurfer) => void
}

function SampleCard({ sample, tierSlug, onPlayRequest }: SampleCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !sample.audio_file) return

    const url = getAudioUrl(tierSlug, sample.audio_file)
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#3b82f6',
      progressColor: '#60a5fa',
      cursorColor: '#93c5fd',
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      height: 72,
      normalize: true,
      url,
    })

    ws.on('ready', () => setReady(true))
    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.on('finish', () => setPlaying(false))

    wavesurferRef.current = ws
    return () => {
      ws.destroy()
      wavesurferRef.current = null
    }
  }, [tierSlug, sample.audio_file])

  const handlePlayClick = () => {
    const ws = wavesurferRef.current
    if (!ws) return
    onPlayRequest(ws)
    ws.playPause()
  }

  return (
    <div className="rounded-xl border border-border bg-surface-elevated overflow-hidden">
      <div className="flex items-stretch gap-3 p-3">
        <button
          type="button"
          onClick={handlePlayClick}
          disabled={!ready}
          className="shrink-0 w-12 h-12 rounded-full bg-accent hover:bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-elevated"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          )}
        </button>
        <div
          ref={containerRef}
          className="flex-1 min-h-[72px] rounded-lg bg-surface-muted border border-border overflow-hidden"
        />
      </div>
      <div className="px-4 pb-4 pt-1">
        <p className="text-sm text-zinc-300 rounded-lg bg-surface-muted p-3 border border-border">
          &ldquo;{sample.transcript}&rdquo;
        </p>
      </div>
    </div>
  )
}

export function PlayerArea({ tier, onError }: PlayerAreaProps) {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const activeWsRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetchSamplesForTier(tier.slug)
      .then((list) => {
        if (!cancelled) setSamples(list)
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load tier data'
        if (!cancelled) setLoadError(msg)
        onError?.(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [tier.slug, onError])

  const handlePlayRequest = (ws: WaveSurfer) => {
    if (activeWsRef.current && activeWsRef.current !== ws) {
      activeWsRef.current.pause()
    }
    activeWsRef.current = ws
  }

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
          Ensure <code className="bg-surface-muted px-1 rounded">/audio/{tier.slug}/metadata.json</code> exists
          and the dev server or GitHub Pages is serving the <code className="bg-surface-muted px-1 rounded">public/</code> folder.
        </p>
      </div>
    )
  }

  if (samples.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-4 text-zinc-400">
        <p>No samples in metadata for this tier.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {samples.map((sample, index) => (
        <SampleCard
          key={`${sample.audio_file}-${index}`}
          sample={sample}
          tierSlug={tier.slug}
          onPlayRequest={handlePlayRequest}
        />
      ))}
    </div>
  )
}
