import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Loader2, Layers } from 'lucide-react'
import { parseTaxonomyCsv, type TaxonomyNode } from '../lib/parseCsv'

const getBase = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function TaxonomySection() {
  const [data, setData] = useState<TaxonomyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set())
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    const base = getBase()
    fetch(`${base}/taxonomy_tools_4.fixed.csv`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load taxonomy: ${r.status}`)
        return r.text()
      })
      .then((text) => {
        const nodes = parseTaxonomyCsv(text)
        setData(nodes)
        setOpenDomains(new Set(nodes.length ? [nodes[0].domain] : []))
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const toggleDomain = (domain: string) => {
    setOpenDomains((prev) => {
      const next = new Set(prev)
      if (next.has(domain)) next.delete(domain)
      else next.add(domain)
      return next
    })
  }

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading taxonomy…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Could not load taxonomy</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
        <Layers className="h-5 w-5 text-zinc-500" />
        <span className="font-semibold text-zinc-800">Tool taxonomy (152 tools)</span>
      </div>
      <div className="p-3">
        {data.map((node) => {
          const domainOpen = openDomains.has(node.domain)
          return (
            <div key={node.domain} className="mb-2">
              <button
                type="button"
                onClick={() => toggleDomain(node.domain)}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors"
              >
                {domainOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-sm">
                  {node.domainLabel}
                </span>
                <span className="text-sm font-normal text-zinc-500">
                  {node.categories.length} categories
                </span>
              </button>
              {domainOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {node.categories.map((cat) => {
                    const key = `${node.domain}/${cat.category}`
                    const catOpen = openCategories.has(key)
                    return (
                      <div key={key}>
                        <button
                          type="button"
                          onClick={() => toggleCategory(key)}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          {catOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {cat.categoryLabel}
                          <span className="text-zinc-400 font-normal">({cat.tools.length})</span>
                        </button>
                        {catOpen && (
                          <ul className="ml-6 mt-1 mb-2 space-y-0.5">
                            {cat.tools.map((tool) => (
                              <li
                                key={tool}
                                className="text-sm text-zinc-600 font-mono py-1 px-2 rounded bg-zinc-50 border border-zinc-100"
                              >
                                {tool}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
