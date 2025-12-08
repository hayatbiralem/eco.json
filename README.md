# @chess-openings/eco.json

[![npm version](https://badge.fury.io/js/%40chess-openings%2Feco.json.svg)](https://www.npmjs.com/package/@chess-openings/eco.json)
[![npm downloads](https://img.shields.io/npm/dm/@chess-openings/eco.json.svg)](https://www.npmjs.com/package/@chess-openings/eco.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@chess-openings/eco.json)](https://bundlephobia.com/package/@chess-openings/eco.json)
[![GitHub stars](https://img.shields.io/github/stars/JeffML/eco.json.svg?style=social&label=Star)](https://github.com/JeffML/eco.json)

TypeScript utilities for consuming chess opening data from the eco.json database.

## Features

- 🎯 **12,000+ chess openings** with ECO codes, move sequences, and names
- 🔍 **FEN-based lookup** with automatic position-only fallback
- 🌐 **On-demand data loading** from GitHub (no bundled files)
- 🔄 **Opening transitions** with next/previous position navigation
- 📦 **TypeScript-first** with complete type definitions
- 🚀 **Zero dependencies** (only needs Node.js 18+)

## Installation

```bash
npm install @chess-openings/eco.json
```

## Quick Start

```typescript
import { openingBook, findOpening, getFromTos } from "@chess-openings/eco.json";

// Load all openings
const openings = await openingBook();

// Look up an opening by FEN
const opening = findOpening(
  openings,
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
);

console.log(opening?.name); // "King's Pawn Opening"
console.log(opening?.eco); // "B00"
console.log(opening?.moves); // "1. e4"

// Get next and previous positions
const { next, from } = await getFromTos(
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
);

console.log(next[0]?.name); // "Sicilian Defense"
console.log(from[0]?.name); // "Starting Position"
```

## API Reference

### Opening Data

#### `getLatestEcoJson(options)`

Downloads opening data from GitHub by ECO category.

```typescript
import { getLatestEcoJson } from "@chess-openings/eco.json";

// Load specific categories
const data = await getLatestEcoJson({
  categories: ["A", "B"],
  includeInterpolated: false,
});

// Load everything (default)
const allData = await getLatestEcoJson();
```

**Options:**

- `categories?: EcoCategory[]` - Array of 'A', 'B', 'C', 'D', 'E' (default: all)
- `includeInterpolated?: boolean` - Include gap-filling variations (default: true)

#### `openingBook()`

Returns a merged collection of all openings.

```typescript
import { openingBook } from "@chess-openings/eco.json";

const openings = await openingBook();
// OpeningCollection: Record<FEN, Opening>
```

#### `findOpening(openingBook, fen, positionBook?)`

Looks up an opening by FEN with automatic position-only fallback.

```typescript
import {
  findOpening,
  getPositionBook,
  openingBook,
} from "@chess-openings/eco.json";

const openings = await openingBook();
const posBook = getPositionBook(openings);

const opening = findOpening(openings, fen, posBook);
```

**Parameters:**

- `openingBook: OpeningCollection` - The opening database
- `fen: string` - FEN string to look up
- `positionBook?: PositionBook` - Optional position-only mapping for fallback

**Returns:** `Opening | undefined`

#### `getPositionBook(openingBook)`

Creates a position-only FEN → full FEN array mapping.

```typescript
import { getPositionBook } from "@chess-openings/eco.json";

const positionBook = getPositionBook(openings);
// Record<string, string[]>
```

### Query Methods

#### `getOpeningsByEco(ecoCode, openings?)`

Returns all openings for a specific ECO code.

```typescript
import { getOpeningsByEco } from "@chess-openings/eco.json";

// Get all Caro-Kann Defense variations
const caroKann = await getOpeningsByEco("B12");
console.log(`Found ${caroKann.length} variations`);
```

**Parameters:**

- `ecoCode`: ECO code string (e.g., "B12", "C42")
- `openings`: Optional pre-loaded opening collection

**Returns:** `Promise<Opening[]>`

#### `getOpeningsByEcoCategory(category, openings?)`

Returns all openings for an ECO category (A, B, C, D, or E).

```typescript
import {
  getOpeningsByEcoCategory,
  openingBook,
} from "@chess-openings/eco.json";

// Get all semi-open games (category B)
const semiOpen = await getOpeningsByEcoCategory("B");

// More efficient with pre-loaded book
const book = await openingBook();
const catA = await getOpeningsByEcoCategory("A", book);
const catB = await getOpeningsByEcoCategory("B", book);
```

**Parameters:**

- `category`: ECO category letter ("A", "B", "C", "D", or "E")
- `openings`: Optional pre-loaded opening collection

**Returns:** `Promise<Opening[]>`

**Throws:** Error if category is invalid

#### `getEcoRoots(openings?)`

Returns only canonical ECO root variations (where `isEcoRoot === true`).

```typescript
import { getEcoRoots } from "@chess-openings/eco.json";

const roots = await getEcoRoots();
console.log(`Found ${Object.keys(roots).length} ECO root variations`);

// Check if a position is an ECO root
const fen = "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2";
if (roots[fen]) {
  console.log(`${roots[fen].name} is an ECO root`);
}
```

**Parameters:**

- `openings`: Optional pre-loaded opening collection

**Returns:** `Promise<OpeningCollection>` (FEN → Opening mapping)

### Transition Data

#### `getFromToIndex()`

Downloads pre-indexed transition data from GitHub.

```typescript
import { getFromToIndex } from "@chess-openings/eco.json";

const index = await getFromToIndex();
// { to: Record<string, string[]>, from: Record<string, string[]> }
```

#### `getFromTos(fen, openings?)`

Gets next and previous opening positions with full Opening objects.

```typescript
import { getFromTos } from "@chess-openings/eco.json";

const { next, from } = await getFromTos(fen);
// { next: Opening[], from: Opening[] }
```

**Parameters:**

- `fen: string` - FEN string to look up transitions for
- `openings?: OpeningCollection` - Optional pre-loaded opening collection

**Returns:** `{ next: Opening[], from: Opening[] }`

#### `clearFromToCache()`

Clears the cached transition index.

```typescript
import { clearFromToCache } from "@chess-openings/eco.json";

clearFromToCache();
```

## Types

### `Opening`

```typescript
interface Opening {
  name: string; // "Sicilian Defense"
  moves: string; // "1. e4 c5"
  eco: string; // "B20"
  score?: number | null; // Position evaluation
  next?: Opening[]; // Next positions
  from?: Opening[]; // Previous positions
  src?: string; // Data source
  isEcoRoot?: boolean; // Root ECO variation
  fen?: string; // FEN string
}
```

### `OpeningCollection`

```typescript
type OpeningCollection = Record<FEN, Opening>;
```

### `PositionBook`

```typescript
type PositionBook = Record<string, string[]>;
```

### `FromToIndex`

```typescript
interface FromToIndex {
  to: Record<string, string[]>; // position → next FENs
  from: Record<string, string[]>; // position → previous FENs
}
```

## Data Structure

The eco.json database contains **12,000+ chess opening variations** organized across multiple JSON files:

- **ecoA.json - ecoE.json**: Main opening databases, one per ECO category (A-E)
- **eco_interpolated.json**: Generated variations that bridge gaps between named openings
- **fromTo.json**: Raw transition graph array of `[from_fen, to_fen, from_source, to_source]`
- **fromToPositionIndexed.json**: Pre-indexed transition data (optimized for O(1) lookup)

All data is downloaded on-demand from GitHub and cached in memory.

### Opening Object Schema

Each opening is keyed by **FEN** (Forsyth-Edwards Notation), which uniquely identifies positions:

```json
{
  "rnbqkb1r/pppppppp/8/3nP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq": {
    "src": "eco_tsv",
    "eco": "B03",
    "moves": "1. e4 Nf6 2. e5",
    "name": "Alekhine Defense",
    "aliases": {
      "scid": "Alekhine: 3.d4"
    },
    "scid": "B03a",
    "isEcoRoot": true
  }
}
```

#### Field Descriptions

- **fen** (key): Unique position identifier using Forsyth-Edwards Notation. Can be full FEN (with turn, castling, en passant) or position-only (first field).
- **src**: Data source - `eco_tsv` (authoritative), `eco_js`, `scid`, `eco_wikip`, `wiki_b`, `ct`, `chessGraph`, `chronos`, `icsbot`, `pgn`, or `interpolated`
- **eco**: ECO category code (e.g., "B03") - not unique; many openings share the same ECO code
- **moves**: Standard algebraic notation move sequence (e.g., "1. e4 Nf6 2. e5")
- **name**: Opening name (e.g., "Alekhine Defense")
- **aliases**: Alternative names from other sources (object with source keys)
- **scid**: Extended SCID code when applicable (e.g., "B03a")
- **isEcoRoot**: `true` if this is the canonical root variation for this ECO code

### Source Hierarchy

**eco_tsv** (from [lichess](https://github.com/lichess-org/chess-openings)) is the authoritative source and supersedes all conflicts. Other sources are merged with eco_tsv taking precedence.

### Interpolated Openings

"Orphan" variations lack a `from` field (no preceding named variation). Interpolations fill these gaps:

```json
{
  "rnbqkbnr/pppppppp/8/4P3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3": {
    "src": "interpolated",
    "eco": "B02",
    "moves": "1. e4 Nf6 2. e5 Ng8 3. d4",
    "name": "Alekhine Defense: Brooklyn Variation (i)",
    "scid": "B02l",
    "aliases": {
      "scid": "Alekhine: Brooklyn Defence (Retreat Variation)"
    }
  }
}
```

**Key characteristics:**
- **src**: "interpolated"
- **name**: Root name + " (i)" suffix
- **Purpose**: Every move subsequence that appears within an opening has an entry

For example, if "Queen's Gambit Declined: Exchange Variation" is "1. d4 Nf6 2. c4 e6 3. Nc3 d5 4. cxd5" but no entry exists for "1. d4 Nf6 2. c4 e6 3. Nc3 d5", an interpolated opening is created to bridge the gap.

### FEN as Primary Key

- FEN strings uniquely identify positions
- Move sequences and names are NOT unique identifiers
- Multiple move orders (transpositions) can reach the same FEN
- Always use FEN for lookups, not moves or names

### Data Sources

This data is a collation of several chess opening databases:

- **eco_tsv**: [lichess chess-openings](https://github.com/lichess-org/chess-openings) (Jun. 2025)
- **eco_js**: Original eco.json data from several years ago
- **scid**: [SCID project](https://scid.sourceforge.net/) database
- **eco_wikip**: [Wikipedia List of Chess Openings](https://en.wikipedia.org/wiki/List_of_chess_openings) (Aug. 2024)
- **wiki_b**: [Wikibooks Chess Opening Theory](https://en.wikibooks.org/wiki/Chess_Opening_Theory) (Nov. 2024)
- **ct**: [ChessTempo](https://chesstempo.com/) (Jun 2025)
- **chessGraph**: [chess-graph](https://github.com/Destaq/chess-graph) (Jun 2025)
- **chronos**: chronos eco.pgn (Jun 2025)
- **icsbot**: [icsbot](https://github.com/seberg/icsbot/blob/master/misc/eco.txt) (Jun 2025)
- **pgn**: Various PGN file databases (Jun 2025)

## Performance Tips

1. **Reuse loaded data**: Call `openingBook()` once and reuse the result
2. **Pre-build position book**: Create once with `getPositionBook()` if doing multiple lookups
3. **Cache transitions**: `getFromTos()` caches the index automatically
4. **Pass openings**: Provide pre-loaded openings to `getFromTos()` to skip re-fetching

```typescript
// Efficient pattern
const openings = await openingBook();
const posBook = getPositionBook(openings);

for (const fen of fens) {
  const opening = findOpening(openings, fen, posBook);
  const transitions = await getFromTos(fen, openings);
}
```

## Acknowledgements

Thanks to [@niklasf](https://github.com/niklasf) for [eco](https://github.com/niklasf/eco).

Credit goes to Shane Hudson for the original SCID opening data.

Original eco.json data was compiled by Ömür Yanıkoğlu.

## Contributing

This package provides read-only utilities for consuming opening data. For data maintenance and updates:

- **Data source**: [eco.json repository](https://github.com/JeffML/eco.json)
- **Data tooling**: [eco.json.tooling repository](https://github.com/JeffML/eco.json.tooling)

## License

MIT

## Related Projects

- [eco.json](https://github.com/JeffML/eco.json) - Chess opening database
- [fensterchess](https://fensterchess.com) - Chess opening research tool
