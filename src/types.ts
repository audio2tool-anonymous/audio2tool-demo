export interface ToolCall {
  tool: string
  parameters: Record<string, unknown>
}

export interface GroundTruth {
  tool_calls: ToolCall[]
}

export interface Sample {
  audio_file: string
  /** Tier 7 (multiturn): one file per turn in order. When set, UI shows all turns. */
  audio_files?: string[]
  transcript: string
  ground_truth: GroundTruth
  reasoning: string
}

export interface TierInfo {
  tier_number: number
  name: string
  description: string
}

export interface TierMetadata {
  tier_info: TierInfo
  samples: Sample[]
}

export interface TierConfig {
  id: number
  slug: string
  name: string
  subtitle: string
  challenge: string
}

export interface FigureItem {
  id: string
  file: string
  title: string
  caption: string
}

export const TIER_CONFIGS: TierConfig[] = [
  { id: 1, slug: 'tier1', name: 'Direct', subtitle: 'Single direct command', challenge: 'Simple intent recognition.' },
  { id: 2, slug: 'tier2', name: 'Parametric', subtitle: 'Slot/value extraction', challenge: 'Parameter/slot extraction.' },
  { id: 3, slug: 'tier3', name: 'Multi-Intent', subtitle: 'Multiple actions in one utterance', challenge: 'Parallel tool execution.' },
  { id: 4, slug: 'tier4', name: 'Implicit', subtitle: 'Indirect or implied intent', challenge: 'Pragmatic inference.' },
  { id: 5, slug: 'tier5', name: 'Needle', subtitle: 'Long speech with tangents', challenge: 'Filtering irrelevant context.' },
  { id: 6, slug: 'tier6', name: 'Correction', subtitle: 'Mid-utterance repair', challenge: 'Mid-utterance state repair.' },
  { id: 7, slug: 'tier7', name: 'Conversation', subtitle: 'Multi-turn dialogue', challenge: 'Persistent intent tracking.' },
  { id: 8, slug: 'tier8', name: 'Intent Blending', subtitle: 'Multiple speakers / primary focus', challenge: 'Speaker diarization / primary actor focus.' },
]
