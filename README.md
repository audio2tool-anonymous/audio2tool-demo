# Audio2Tool: Benchmark Demo

A single-page research demo for the **Audio2Tool** benchmark, showcasing the eight complexity tiers with audio samples, transcripts, and ground-truth tool calls.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Hosting on GitHub Pages (anonymous repo)

1. **Create a new repository** (e.g. `audio2tool-demo`) on GitHub. You can create it under an anonymous or secondary account for review.

2. **Copy this folder** into the new repo (or clone the new repo and copy these files into it).

3. **Add real audio and metadata**  
   Place your `.wav` files in `public/audio/tier1/` … `public/audio/tier8/` and update each tier's `metadata.json` to match your samples (see structure below).

4. **Build for GitHub Pages**  
   Use your repo name as the base path:

   ```bash
   npm install
   npm run build -- --base /YOUR-REPO-NAME/
   ```

   Or set the base in `vite.config.ts`:

   ```ts
   base: '/your-repo-name/',
   ```

   Then run `npm run build`.

5. **Deploy**  
   - Enable GitHub Pages in the repo (Settings → Pages).  
   - Source: **GitHub Actions** (recommended) or **Deploy from branch** (e.g. `gh-pages` with the contents of `dist/`).  
   - If using "Deploy from branch", push the built `dist/` contents to the chosen branch.

## Results & Figures

The **Results & Figures** tab shows interactive figures from the paper (e.g. query distributions, domain breakdowns). To add your own graphs:

1. Put image files (PNG, JPG, SVG) in **`public/figures/`**.
2. Edit **`public/figures/figures.json`** and add an entry per figure:
   ```json
   {
     "id": "fig1",
     "file": "your-chart.png",
     "title": "Short title",
     "caption": "Optional caption shown below the figure."
   }
   ```

Figures appear in a grid; clicking one opens a lightbox. Order in the list is the display order.

## Metadata format

Each tier folder (`public/audio/tier1/` … `tier8/`) should contain:

- **metadata.json** — tier info and list of samples (see below).
- **.wav files** — referenced by `audio_file` in each sample.

Example **metadata.json**:

```json
{
  "tier_info": {
    "tier_number": 3,
    "name": "Multi-Intent",
    "description": "Single utterances expressing multiple intents."
  },
  "samples": [
    {
      "audio_file": "sample_3_001.wav",
      "transcript": "Defrost the windshield and find a charger.",
      "ground_truth": {
        "tool_calls": [
          { "tool": "defrost_windshield", "parameters": {} },
          { "tool": "find_charging_station", "parameters": {} }
        ]
      },
      "reasoning": "Two distinct actions connected by 'and'."
    }
  ]
}
```

Add as many entries to `samples` as you have; the demo will pick one at random when you click "Randomize".

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- wavesurfer.js (waveform)
- lucide-react (icons)

## License

Same as the Audio2Tool paper/repository.
