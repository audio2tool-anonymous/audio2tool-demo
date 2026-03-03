/**
 * Simple CSV row parser: handles quoted fields with commas.
 */
function parseCsvRow(line: string): string[] {
  const out: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      i += 1
      let field = ''
      while (i < line.length) {
        if (line[i] === '"') {
          i += 1
          if (line[i] === '"') {
            field += '"'
            i += 1
          } else break
        } else {
          field += line[i]
          i += 1
        }
      }
      out.push(field)
    } else {
      let field = ''
      while (i < line.length && line[i] !== ',') {
        field += line[i]
        i += 1
      }
      out.push(field)
      if (line[i] === ',') i += 1
    }
  }
  return out
}

export interface TaxonomyRow {
  tool_id: string
  domain: string
  category: string
  tool_name: string
  description: string
}

export interface TaxonomyNode {
  domain: string
  domainLabel: string
  categories: { category: string; categoryLabel: string; tools: string[] }[]
}

const DOMAIN_LABELS: Record<string, string> = {
  smart_car: 'Smart Car',
  smart_home: 'Smart Home',
  wearables: 'Wearables',
}

function categoryLabel(cat: string): string {
  return cat
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function parseTaxonomyCsv(csvText: string): TaxonomyNode[] {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = parseCsvRow(lines[0])
  const domainIdx = header.indexOf('domain')
  const categoryIdx = header.indexOf('category')
  const toolNameIdx = header.indexOf('tool_name')
  if (domainIdx < 0 || categoryIdx < 0 || toolNameIdx < 0) return []

  const byDomain = new Map<string, Map<string, string[]>>()

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i])
    const domain = row[domainIdx]?.trim() || ''
    const category = row[categoryIdx]?.trim() || ''
    const tool = row[toolNameIdx]?.trim() || ''
    if (!domain || !category || !tool) continue

    if (!byDomain.has(domain)) {
      byDomain.set(domain, new Map())
    }
    const byCat = byDomain.get(domain)!
    if (!byCat.has(category)) byCat.set(category, [])
    byCat.get(category)!.push(tool)
  }

  const result: TaxonomyNode[] = []
  for (const [domain, byCat] of byDomain) {
    const categories = Array.from(byCat.entries()).map(([category, tools]) => ({
      category,
      categoryLabel: categoryLabel(category),
      tools: tools.sort(),
    }))
    result.push({
      domain,
      domainLabel: DOMAIN_LABELS[domain] || domain,
      categories: categories.sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel)),
    })
  }
  result.sort((a, b) => a.domainLabel.localeCompare(b.domainLabel))
  return result
}
