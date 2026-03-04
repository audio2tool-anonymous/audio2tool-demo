/**
 * Generates public/taxonomy.svg from taxonomy_tools_4.fixed.csv.
 * Run from project root: node scripts/generate-taxonomy-diagram.js
 * Input CSV path: first argument or ./taxonomy_tools_4.fixed.csv
 */

const fs = require('fs');
const path = require('path');

function parseCsvRow(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i += 1;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"') {
          i += 1;
          if (line[i] === '"') {
            field += '"';
            i += 1;
          } else break;
        } else {
          field += line[i];
          i += 1;
        }
      }
      out.push(field);
    } else {
      let field = '';
      while (i < line.length && line[i] !== ',') {
        field += line[i];
        i += 1;
      }
      out.push(field);
      if (line[i] === ',') i += 1;
    }
  }
  return out;
}

const DOMAIN_LABELS = { smart_car: 'Smart Car', smart_home: 'Smart Home', wearables: 'Wearables' };
function categoryLabel(cat) {
  return cat.split(/[_-]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function parseCsv(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = parseCsvRow(lines[0]);
  const domainIdx = header.indexOf('domain');
  const categoryIdx = header.indexOf('category');
  const toolNameIdx = header.indexOf('tool_name');
  if (domainIdx < 0 || categoryIdx < 0 || toolNameIdx < 0) return [];

  const byDomain = new Map();
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    const domain = (row[domainIdx] || '').trim();
    const category = (row[categoryIdx] || '').trim();
    const tool = (row[toolNameIdx] || '').trim();
    if (!domain || !category || !tool) continue;
    if (!byDomain.has(domain)) byDomain.set(domain, new Map());
    const byCat = byDomain.get(domain);
    if (!byCat.has(category)) byCat.set(category, []);
    byCat.get(category).push(tool);
  }

  const result = [];
  for (const [domain, byCat] of byDomain) {
    const categories = Array.from(byCat.entries()).map(([category, tools]) => ({
      category,
      categoryLabel: categoryLabel(category),
      count: tools.length,
    }));
    result.push({
      domain,
      domainLabel: DOMAIN_LABELS[domain] || domain,
      categories: categories.sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel)),
    });
  }
  result.sort((a, b) => a.domainLabel.localeCompare(b.domainLabel));
  return result;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateSvg(nodes) {
  const pad = 24;
  const domainW = 200;
  const domainH = 36;
  const catW = 180;
  const catH = 28;
  const gap = 16;
  const domainColor = '#2563eb';
  const categoryColor = '#3b82f6';
  const textColor = '#1e293b';

  let y = pad;
  const width = 3 * domainW + 2 * gap + 2 * pad;
  let maxY = y;

  const parts = [];

  // Title
  parts.push(`<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="${textColor}">Tool taxonomy (152 tools)</text>`);
  y += 40;
  maxY = y;

  // Three columns: one per domain
  const colWidth = domainW + gap + catW;
  const startX = pad;

  nodes.forEach((node, colIndex) => {
    const x = startX + colIndex * (colWidth + gap);
    let cy = y;

    // Domain box
    parts.push(`<rect x="${x}" y="${cy}" width="${domainW}" height="${domainH}" rx="6" fill="${domainColor}" fill-opacity="0.15" stroke="${domainColor}" stroke-width="1.5"/>`);
    parts.push(`<text x="${x + domainW / 2}" y="${cy + domainH / 2 + 5}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="${domainColor}">${escapeXml(node.domainLabel)}</text>`);
    cy += domainH + 8;

    node.categories.forEach((cat) => {
      parts.push(`<rect x="${x}" y="${cy}" width="${catW}" height="${catH}" rx="4" fill="#f1f5f9" stroke="#e2e8f0"/>`);
      parts.push(`<text x="${x + 10}" y="${cy + catH / 2 + 4}" font-family="system-ui,sans-serif" font-size="12" fill="${textColor}">${escapeXml(cat.categoryLabel)}</text>`);
      parts.push(`<text x="${x + catW - 10}" y="${cy + catH / 2 + 4}" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" fill="#64748b">${cat.count}</text>`);
      cy += catH + 4;
    });

    if (cy > maxY) maxY = cy;
  });

  maxY += pad;
  const height = maxY;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="white"/>
  ${parts.join('\n  ')}
</svg>`;
}

const csvPath = process.argv[2] || path.join(__dirname, '..', 'taxonomy_tools_4.fixed.csv');
const outPath = path.join(__dirname, '..', 'public', 'taxonomy.svg');

if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  console.error('Usage: node scripts/generate-taxonomy-diagram.js [path/to/taxonomy_tools_4.fixed.csv]');
  process.exit(1);
}

const nodes = parseCsv(csvPath);
const svg = generateSvg(nodes);
fs.writeFileSync(outPath, svg, 'utf8');
console.log('Wrote', outPath);
