const getBase = () => {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

export function TaxonomySection() {
  const src = `${getBase()}/taxonomy.svg`

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4">
        <p className="text-sm text-zinc-600 mb-4">
          Domains and categories with tool counts. Diagram generated from the benchmark taxonomy.
        </p>
        <img
          src={src}
          alt="Tool taxonomy: Smart Car, Smart Home, Wearables — domains, categories, and tool counts"
          className="w-full h-auto max-w-4xl rounded-lg border border-zinc-200"
        />
      </div>
    </div>
  )
}
