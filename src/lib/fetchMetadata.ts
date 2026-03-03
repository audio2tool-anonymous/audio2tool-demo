import type { TierMetadata, Sample } from '../types'

const getBase = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/**
 * Fetches metadata.json from the specified tier folder (e.g. tier1, tier2, ... tier8).
 */
export async function fetchTierMetadata(tierSlug: string): Promise<TierMetadata> {
  const base = getBase()
  const url = `${base}/audio/${tierSlug}/metadata.json`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load tier metadata: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<TierMetadata>
}

/**
 * Returns a random sample from the tier's metadata.
 */
export function getRandomSample(metadata: TierMetadata): Sample | null {
  const { samples } = metadata
  if (!samples?.length) return null
  const index = Math.floor(Math.random() * samples.length)
  return samples[index] ?? null
}

/**
 * Fetches tier metadata and returns a random sample.
 */
export async function fetchRandomSampleForTier(tierSlug: string): Promise<{
  metadata: TierMetadata
  sample: Sample | null
}> {
  const metadata = await fetchTierMetadata(tierSlug)
  const sample = getRandomSample(metadata)
  return { metadata, sample }
}
