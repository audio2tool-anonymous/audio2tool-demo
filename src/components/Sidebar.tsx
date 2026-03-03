import { Layers } from 'lucide-react'
import type { TierConfig } from '../types'

interface SidebarProps {
  tiers: TierConfig[]
  selectedTierId: number
  onSelectTier: (id: number) => void
}

export function Sidebar({ tiers, selectedTierId, onSelectTier }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface-elevated flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <Layers className="h-4 w-4" />
          Complexity Tiers
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {tiers.map((tier) => {
          const isSelected = tier.id === selectedTierId
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className={`
                w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors
                ${isSelected
                  ? 'bg-accent-muted text-white font-medium'
                  : 'text-zinc-400 hover:bg-surface-muted hover:text-zinc-200'}
              `}
            >
              <span className="block font-medium">Tier {tier.id}</span>
              <span className="block text-xs mt-0.5 opacity-90">{tier.name}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
