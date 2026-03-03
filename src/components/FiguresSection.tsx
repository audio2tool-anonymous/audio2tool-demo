import { useState, useEffect, useCallback } from 'react'
import { Image, X, Loader2 } from 'lucide-react'
import type { FigureItem } from '../types'
import { fetchFigures, getFigureImageUrl } from '../lib/fetchFigures'

export function FiguresSection() {
  const [figures, setFigures] = useState<FigureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<FigureItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchFigures().then((list) => {
      if (!cancelled) setFigures(list)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, closeLightbox])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading figures…</p>
      </div>
    )
  }

  if (figures.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated p-8 text-center text-zinc-400">
        <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium text-zinc-300">No figures yet</p>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Add graph images to <code className="bg-surface-muted px-1.5 py-0.5 rounded">public/figures/</code> and
          list them in <code className="bg-surface-muted px-1.5 py-0.5 rounded">figures/figures.json</code> with
          <code className="bg-surface-muted px-1.5 py-0.5 rounded ml-1">file</code>, <code className="bg-surface-muted px-1.5 py-0.5 rounded">title</code>, and <code className="bg-surface-muted px-1.5 py-0.5 rounded">caption</code>.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {figures.map((fig) => (
          <button
            key={fig.id}
            type="button"
            onClick={() => setLightbox(fig)}
            className="group text-left rounded-xl border border-border bg-surface-elevated overflow-hidden hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            <div className="aspect-video bg-surface-muted flex items-center justify-center overflow-hidden">
              <img
                src={getFigureImageUrl(fig.file)}
                alt={fig.title}
                className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"><rect fill="#1a1a1a" width="400" height="225"/><text x="200" y="115" fill="#52525b" font-family="sans-serif" font-size="14" text-anchor="middle">${fig.file}</text></svg>`
                  )
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white group-hover:text-accent transition-colors">{fig.title}</h3>
              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{fig.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Figure fullscreen"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getFigureImageUrl(lightbox.file)}
              alt={lightbox.title}
              className="max-h-[80vh] w-full object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-center">
              <p className="font-semibold text-white">{lightbox.title}</p>
              <p className="text-sm text-zinc-400 mt-1">{lightbox.caption}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
