# @chess-openings/eco.json

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
import { openingBook, findOpening, getFromTos } from '@chess-openings/eco.json';

// Load all openings
const openings = await openingBook();

// Look up an opening by FEN
const opening = findOpening(
  openings,
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
);

console.log(opening?.name); // "King's Pawn Opening"
console.log(opening?.eco);  // "B00"
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
import { getLatestEcoJson } from '@chess-openings/eco.json';

// Load specific categories
const data = await getLatestEcoJson({
  categories: ['A', 'B'],
  includeInterpolated: false
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
import { openingBook } from '@chess-openings/eco.json';

const openings = await openingBook();
// OpeningCollection: Record<FEN, Opening>
```

#### `findOpening(openingBook, fen, positionBook?)`

Looks up an opening by FEN with automatic position-only fallback.

```typescript
import { findOpening, getPositionBook, openingBook } from '@chess-openings/eco.json';

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
import { getPositionBook } from '@chess-openings/eco.json';

const positionBook = getPositionBook(openings);
// Record<string, string[]>
```

### Transition Data

#### `getFromToIndex()`

Downloads pre-indexed transition data from GitHub.

```typescript
import { getFromToIndex } from '@chess-openings/eco.json';

const index = await getFromToIndex();
// { to: Record<string, string[]>, from: Record<string, string[]> }
```

#### `getFromTos(fen, openings?)`

Gets next and previous opening positions with full Opening objects.

```typescript
import { getFromTos } from '@chess-openings/eco.json';

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
import { clearFromToCache } from '@chess-openings/eco.json';

clearFromToCache();
```

## Types

### `Opening`

```typescript
interface Opening {
  name: string;           // "Sicilian Defense"
  moves: string;          // "1. e4 c5"
  eco: string;            // "B20"
  score?: number | null;  // Position evaluation
  next?: Opening[];       // Next positions
  from?: Opening[];       // Previous positions
  src?: string;           // Data source
  isEcoRoot?: boolean;    // Root ECO variation
  fen?: string;           // FEN string
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
  to: Record<string, string[]>;    // position → next FENs
  from: Record<string, string[]>;  // position → previous FENs
}
```

## Data Structure

The eco.json database contains:

- **ecoA-E.json**: Main opening databases by ECO category
- **eco_interpolated.json**: Gap-filling variations
- **fromToPositionIndexed.json**: Pre-indexed transition data

All data is downloaded on-demand from GitHub and cached in memory.

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

## Contributing

This package provides read-only utilities for consuming opening data. For data maintenance and updates:

- **Data source**: [eco.json repository](https://github.com/JeffML/eco.json)
- **Data tooling**: [eco.json.tooling repository](https://github.com/JeffML/eco.json.tooling)

## License

MIT

## Related Projects

- [eco.json](https://github.com/JeffML/eco.json) - Chess opening database
- [fensterchess](https://fensterchess.com) - Chess opening research tool
