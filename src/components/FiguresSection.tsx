import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { FigureItem } from '../types'
import { fetchFigures, getFigureImageUrl } from '../lib/fetchFigures'

const MAX_FIGURES = 3

function isPdf(file: string) {
  return file.toLowerCase().endsWith('.pdf')
}

export function FiguresSection() {
  const [figures, setFigures] = useState<FigureItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchFigures()
      .then((list) => {
        if (!cancelled) setFigures(list.slice(0, MAX_FIGURES))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading figures…</p>
      </div>
    )
  }

  if (figures.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center text-zinc-500">
        <p>No figures configured. Add entries to <code className="bg-white px-1.5 py-0.5 rounded">public/figures/figures.json</code>.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {figures.map((fig) => (
        <div key={fig.id} className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50">
            <h3 className="font-semibold text-zinc-800">{fig.title}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">{fig.caption}</p>
          </div>
          <div className="p-4 bg-white min-h-[320px]">
            {isPdf(fig.file) ? (
              <embed
                src={getFigureImageUrl(fig.file)}
                type="application/pdf"
                className="w-full rounded-lg border border-zinc-200"
                style={{ height: '420px' }}
                title={fig.title}
              />
            ) : (
              <img
                src={getFigureImageUrl(fig.file)}
                alt={fig.title}
                className="w-full h-auto rounded-lg border border-zinc-200 object-contain max-h-[500px]"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
