import type { FigureItem } from '../types'

const getBase = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function getFigureImageUrl(file: string): string {
  const base = getBase()
  const path = base.endsWith('/') ? base : `${base}/`
  return `${path}figures/${file}`
}

/**
 * Fetches the figures manifest from public/figures/figures.json.
 * Add your graph images to public/figures/ and update figures.json with file, title, caption.
 */
export async function fetchFigures(): Promise<FigureItem[]> {
  const base = getBase()
  const res = await fetch(`${base}/figures/figures.json`)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
