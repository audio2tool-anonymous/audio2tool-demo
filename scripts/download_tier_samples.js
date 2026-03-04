/**
 * Download 3 samples per tier from S3 and write metadata.json.
 * Requires: AWS CLI configured, run from project root.
 * Usage: node scripts/download_tier_samples.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const S3_CSV_PREFIX = 's3://iciv-data-dev/Audio2Tool/Audio2Tool-v0/Audio2Tool-v0/';
const S3_AUDIO_PREFIX = 's3://iciv-data-dev/Audio2Tool/Audio2Tool-v0/';

const TIER_CONFIG = [
  { tier: 1, csv: 'tier1_queries_cleaned_v2.csv', folder: 'tier1_queries_cleaned_v2' },
  { tier: 2, csv: 'tier2_parametric_queries.csv', folder: 'tier2_parametric_queries' },
  { tier: 3, csv: 'tier3_multi_intent_queries.csv', folder: 'tier3_multi_intent_queries' },
  { tier: 4, csv: 'tier4_implicit_queries.csv', folder: 'tier4_implicit_queries' },
  { tier: 5, csv: 'tier5_needle_queries_multiendpoint.csv', folder: 'tier5_needle_queries_multiendpoint' },
  { tier: 6, csv: 'tier6_correction_queries.csv', folder: 'tier6_correction_queries' },
  { tier: 7, csv: 'tier7_multiturn_queries.csv', folder: 'tier7_multiturn_queries' },
];

const TIER_NAMES = {
  1: 'Direct', 2: 'Parametric', 3: 'Multi-Intent', 4: 'Implicit',
  5: 'Needle', 6: 'Correction', 7: 'Conversation',
};

function parseCsvRow(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') { field += '"'; i++; }
          else break;
        } else {
          field += line[i];
          i++;
        }
      }
      out.push(field);
    } else {
      let field = '';
      while (i < line.length && line[i] !== ',') {
        field += line[i];
        i++;
      }
      out.push(field);
      if (line[i] === ',') i++;
    }
  }
  return out;
}

function parseParams(s) {
  if (!s || s === '{}') return {};
  try {
    const json = s.replace(/'/g, '"');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

function main() {
  const publicDir = path.join(__dirname, '..', 'public', 'audio');
  const tmpDir = path.join(__dirname, '..', 'tmp_csv');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  for (const { tier, csv, folder } of TIER_CONFIG) {
    const tierSlug = `tier${tier}`;
    const outDir = path.join(publicDir, tierSlug);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Remove existing .wav files so we replace with new diverse samples
    const existing = fs.readdirSync(outDir).filter((f) => f.endsWith('.wav'));
    for (const f of existing) {
      fs.unlinkSync(path.join(outDir, f));
      console.log(`Tier ${tier}: removed ${f}`);
    }

    const csvPath = path.join(tmpDir, csv);
    console.log(`Tier ${tier}: downloading CSV...`);
    run(`aws s3 cp "${S3_CSV_PREFIX}${csv}" "${csvPath}"`);

    const text = fs.readFileSync(csvPath, 'utf8');
    // Merge multi-line quoted fields into single lines so split yields one row per record
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const rawLines = [];
    let i = 0;
    while (i < normalized.length) {
      let line = '';
      while (i < normalized.length) {
        const ch = normalized[i];
        if (ch === '"') {
          line += ch;
          i++;
          while (i < normalized.length) {
            const c = normalized[i];
            if (c === '"') {
              line += c;
              i++;
              if (normalized[i] === '"') { line += '"'; i++; }
              else break;
            } else if (c === '\n') {
              line += '\n';
              i++;
            } else {
              line += c;
              i++;
            }
          }
          continue;
        }
        if (ch === '\n') {
          i++;
          break;
        }
        line += ch;
        i++;
      }
      if (line.trim()) rawLines.push(line);
    }
    const lines = rawLines;
    const header = parseCsvRow(lines[0]);
    const queryIdx = header.indexOf('query');
    const toolNameIdx = header.indexOf('tool_name');
    const extractedIdx = header.indexOf('extracted_params');
    if (queryIdx < 0 || toolNameIdx < 0) {
      console.warn(`Tier ${tier}: missing columns, skip`);
      continue;
    }

    const numDataRows = lines.length - 1;
    if (numDataRows < 3) {
      console.warn(`Tier ${tier}: fewer than 3 rows, skip`);
      continue;
    }

    // Pick 3 row indices spread across the CSV for different queries (and ideally different tools)
    const rowIndices = [
      0,
      Math.floor(numDataRows / 2),
      numDataRows - 1,
    ];
    const samples = [];
    const isTier7 = tier === 7;

    for (let sampleIdx = 0; sampleIdx < 3; sampleIdx++) {
      const rowIndex = rowIndices[sampleIdx];

      // Prefer 3dspeaker WAVs only (no voxpopuli)
      let rowIndexToUse = rowIndex;
      let wavLines = [];
      for (let attempt = 0; attempt < 50 && rowIndexToUse + 1 < lines.length; attempt++) {
        const queryFolder = `query_${String(rowIndexToUse).padStart(5, '0')}`;
        const s3List = run(`aws s3 ls "${S3_AUDIO_PREFIX}${folder}/${queryFolder}/"`);
        const allWavs = s3List.split('\n').filter((l) => l.trim().endsWith('.wav'));
        wavLines = allWavs.filter((l) => /3dspeaker|3d_speaker/i.test(l.trim().split(/\s+/).pop() || ''));
        if (wavLines.length > 0) break;
        rowIndexToUse++;
      }
      if (wavLines.length === 0) {
        console.warn(`Tier ${tier}: no 3dspeaker wav found for row ${rowIndex} and following, skip sample ${sampleIdx + 1}`);
        continue;
      }
      const queryFolder = `query_${String(rowIndexToUse).padStart(5, '0')}`;
      const rowToUse = parseCsvRow(lines[rowIndexToUse + 1]);
      const query = (rowToUse[queryIdx] || '').trim();
      const toolName = (rowToUse[toolNameIdx] || '').trim();
      const extractedParams = extractedIdx >= 0 ? parseParams((rowToUse[extractedIdx] || '').trim()) : {};
      if (!query || !toolName) continue;

      if (isTier7) {
        // Tier 7: download all turns for this conversation (sort by turn_00, turn_01, ...)
        const wavNames = wavLines.map((l) => l.trim().split(/\s+/).pop()).filter(Boolean).sort();
        const prefix = `conv${sampleIdx}_`;
        const audioFiles = [];
        for (let t = 0; t < wavNames.length; t++) {
          const origName = wavNames[t];
          const localName = prefix + origName;
          const s3Wav = `${S3_AUDIO_PREFIX}${folder}/${queryFolder}/${origName}`;
          const localWav = path.join(outDir, localName);
          console.log(`Tier 7 sample ${sampleIdx + 1} turn ${t + 1}/${wavNames.length}: ${localName}`);
          run(`aws s3 cp "${s3Wav}" "${localWav}"`);
          audioFiles.push(localName);
        }
        samples.push({
          audio_file: audioFiles[0],
          audio_files: audioFiles,
          transcript: query,
          ground_truth: {
            tool_calls: [{ tool: toolName, parameters: extractedParams }],
          },
          reasoning: '',
        });
      } else {
        // Tiers 1–6: one WAV per sample (different speaker per sample)
        const wavIndex = Math.min(sampleIdx, wavLines.length - 1);
        const wavName = wavLines[wavIndex].trim().split(/\s+/).pop();
        const s3Wav = `${S3_AUDIO_PREFIX}${folder}/${queryFolder}/${wavName}`;
        const localWav = path.join(outDir, wavName);
        console.log(`Tier ${tier} sample ${sampleIdx + 1} (query ${rowIndexToUse}, 3dspeaker ${wavIndex}): ${wavName}`);
        run(`aws s3 cp "${s3Wav}" "${localWav}"`);
        samples.push({
          audio_file: wavName,
          transcript: query,
          ground_truth: {
            tool_calls: [{ tool: toolName, parameters: extractedParams }],
          },
          reasoning: '',
        });
      }
    }

    const metadata = {
      tier_info: {
        tier_number: tier,
        name: TIER_NAMES[tier] || `Tier ${tier}`,
        description: '',
      },
      samples,
    };
    const metaPath = path.join(outDir, 'metadata.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');
    console.log(`Tier ${tier}: wrote ${metaPath} with ${samples.length} samples.`);
  }

  console.log('Done.');
}

main();
