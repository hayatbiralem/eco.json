# Copilot Instructions for eco.json

## Project Overview

This is a **data-only repository** containing 12,000+ chess opening variations encoded in JSON format. The data is organized by ECO (Encyclopedia of Chess Openings) categories A-E and includes interpolated variations to fill gaps.

## Core Data Structure

### Primary Data Files

- **ecoA.json - ecoE.json**: Main opening databases, one per ECO category
- **eco_interpolated.json**: Generated variations that bridge gaps between named openings
- **fromTo.json**: Array of `[from_fen, to_fen, from_source, to_source]` representing opening transition graph

### Opening Object Schema

Each opening is keyed by **FEN** (Forsyth-Edwards Notation), which uniquely identifies positions:

```json
{
  "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq": {
    "src": "eco_tsv", // Authoritative source
    "eco": "B03", // ECO category code (not unique)
    "moves": "1. e4 Nf6 2. e5", // Standard move sequence
    "name": "Alekhine Defense",
    "aliases": {
      // Alternative names from other sources
      "scid": "Alekhine: 3.d4"
    },
    "scid": "B03a", // Extended SCID code (when applicable)
    "isEcoRoot": true // True if this is the root variation for this ECO code
  }
}
```

## Key Concepts

### Source Hierarchy

**eco_tsv** (from lichess) is the authoritative source and supersedes all conflicts. Other sources: eco_js, scid, eco_wikip, wiki_b, ct, chessGraph, chronos, icsbot, pgn.

### Interpolated Openings

"Orphan" variations lack a `from` field (no preceding named variation). Interpolations fill these gaps:

- **src**: "interpolated"
- **rootSrc**: Original source of the root variation
- **name**: Root name + " (i)" suffix (may have multiple with same name)

Example: If "1. e4 Nf6 2. e5 Ng8 3. d4 d6" exists but "1. e4 Nf6 2. e5 Ng8 3. d4" doesn't, an interpolated opening is created.

### FEN as Primary Key

- FEN strings uniquely identify positions
- Move sequences and names are NOT unique identifiers
- Multiple move orders (transpositions) can reach the same FEN
- Always use FEN for lookups, not moves or names

## Methods (`/methods/`)

The `/methods/` folder contains utility functions for working with eco.json data. These methods are being migrated from `/tooling/` or adapted from other sources like [fensterchess](https://fensterchess.com) on a case-by-case basis.

**Note**: The `/tooling/` folder is deprecated and will be removed. Data maintenance and analysis tools are in the separate [eco.json.tooling](https://github.com/JeffML/eco.json.tooling) repository.

### Common Operations

Methods in this folder provide functionality such as:

- Merging ECO category files
- Querying opening transitions (from/to analysis)
- Finding openings by FEN, name, or ECO code
- Source filtering and validation
- FEN validation and parsing

### FEN Validation Pattern

All FEN inputs are validated with: `/(?!.*\d{2,}.*)^([1-8PNBRQK]+\/){7}[1-8PNBRQK]+$/im`

## Common Patterns

### Loading All Openings

```javascript
import { conjoin } from "./tooling/ecoConjoin.mjs";

// Without interpolations
const openings = conjoin({ includeInterpolated: false });

// With interpolations
const allOpenings = conjoin({ includeInterpolated: true });
```

### Querying Transitions

```javascript
import { from } from "./tooling/from.mjs";
import { to } from "./tooling/to.mjs";

const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3";
const { opening, fromOpenings } = from(fen); // What leads to this position
const { opening, toOpenings } = to(fen); // Where this position leads
```

### Source Filtering

```javascript
import { selectSources, antiSelectSources } from "./tooling/sourcesOps.mjs";

// Only openings from specific sources (use in process.argv)
// node script.js eco_tsv scid

// Exclude a source
// node script.js eco_tsv
```

## Data Integrity Rules

1. **ECO Categories**: Fixed at A, B, C, D, E - no others exist
2. **Interpolations Separation**: Interpolated openings are never in ecoA-E files (sanity check in ecoConjoin.mjs)
3. **FEN Uniqueness**: Each FEN appears exactly once across all eco\*.json files
4. **Source Authority**: eco_tsv overrides all other sources in conflicts
5. **No Package Manager**: This is a data project; scripts are ESM modules (.mjs) run directly with node

## NPM Package

This repository now includes `@chess-openings/eco.json`, a TypeScript npm package for consuming opening data.

**Key distinction:**

- **NPM package (`src/`)**: Read-only utilities for consuming opening data in applications
- **Methods (`methods/`)**: Utility functions for working with the data files
- **eco.json.tooling**: Separate repo for data maintenance and PR generation

The npm package **does not bundle JSON files** - opening data is downloaded on-demand from GitHub to keep the package lightweight.

### Available Methods

**Opening Data:**

- `getLatestEcoJson(options)` - Downloads opening data by ECO category from GitHub
- `openingBook()` - Returns merged collection of all openings
- `findOpening(openingBook, fen, positionBook?)` - Looks up opening by FEN with position-only fallback
- `getPositionBook(openingBook)` - Creates position-only FEN → full FEN mapping

**Transition Data:**

- `getFromToIndex()` - Downloads pre-indexed transition data (fromToPositionIndexed.json)
- `getFromTos(fen, openings?)` - Returns next/from Opening objects for a FEN
- `clearFromToCache()` - Clears cached transition index

## From/To Transition Data

### Structure

**fromTo.json** (source of truth):

- Format: `[from_fen, to_fen, from_source, to_source][]` - flat array of transitions
- Raw transition graph data between named openings
- Maintained by eco.json.tooling

**fromToPositionIndexed.json** (generated, optimized for lookup):

- Format: `{ to: { position: [fens] }, from: { position: [fens] } }`
- Generated by eco.json.tooling/fromToPositionIndex.js
- Optimized for O(1) lookup using position-only FEN keys
- Downloaded on-demand by npm package methods

### Why Pre-generation is Necessary

From/to transitions **cannot be efficiently computed on-demand** because:

1. Only named openings are indexed (sparse graph of ~12,000 nodes)
2. Finding transitions requires matching against all opening move sequences
3. On-demand generation would be O(n) for each lookup vs O(1) with pre-indexed data
4. The index groups transpositions by using position-only FEN keys

### Usage in Methods

The npm package provides `getFromTos(fen)` which:

1. Downloads `fromToPositionIndexed.json` from GitHub (cached)
2. Extracts position-only FEN from input
3. Looks up transition FENs in O(1) time
4. Enriches FEN strings with full Opening objects from openingBook
5. Returns `{ next: Opening[], from: Opening[] }`

## Important Notes

- Opening data files (ecoA-E.json, eco_interpolated.json, fromTo.json) are the core assets
- The npm package provides TypeScript types and utilities for consuming this data
- All openings use standard algebraic notation (SAN) for moves
- ECO codes are categories, not unique identifiers - many openings share the same ECO code
- The `isEcoRoot` field identifies the "official" ECO variation for that code
- When adding new openings, always check for FEN conflicts and respect source hierarchy

## Package Status

**Published**: `@chess-openings/eco.json` v1.1.0 on npm

**Adoption in fensterchess**:

- ✅ Uses `openingBook()` for loading opening data
- ✅ Uses `lookupByMoves()` for opening detection by move sequence
- ✅ Uses `getPositionBook()` for position-only FEN fallback
- ✅ Uses `findOpening()` for FEN-based opening lookup
- ⏳ Still uses serverless function for from/to transitions (could migrate to `getFromTos()`)
- ⏳ Still bundles `data/fromToPositionIndexed.json` (could remove)

## Future Migration Opportunities

**Potential simplifications for fensterchess:**

1. **Replace serverless function** `netlify/functions/getFromTosForFen.js`:

   - Current: Serverless function reads bundled JSON, requires API auth
   - Migrate to: `import { getFromTos } from '@chess-openings/eco.json'`
   - Benefits: No serverless function maintenance, no API auth needed, returns Opening objects directly

2. **Remove bundled data file** `data/fromToPositionIndexed.json`:

   - The npm package downloads this on-demand from GitHub (cached)
   - Benefits: Smaller deployment bundle, automatic updates when eco.json data changes

3. **Simplify client code**:
   - Current: `getFromTosForFen()` fetches FEN arrays, then enriches with Opening objects
   - New: `getFromTos()` returns Opening objects directly
   - Remove enrichment logic from `src/datasource/findOpening.ts`

**Note**: This migration is optional - current approach works fine. The package provides these utilities for projects that want them.
