import type { Opening, OpeningCollection } from "../src/types.js";

/**
 * Position book maps position-only FEN (without turn/castling/en passant) to full FENs.
 * Used for fallback when exact FEN match fails.
 */
export interface PositionBook {
  [position: string]: string[];
}

/**
 * Creates a position book from an opening collection.
 * This allows looking up positions without turn, castling, or en passant information.
 *
 * @param openingBook - The complete opening collection
 * @returns Position book mapping position-only FEN to array of full FENs
 *
 * @example
 * ```typescript
 * const openings = await openingBook();
 * const posBook = getPositionBook(openings);
 *
 * // Look up position without game state
 * const fens = posBook["rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR"];
 * // Returns: ["rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"]
 * ```
 */
export function getPositionBook(openingBook: OpeningCollection): PositionBook {
  const positionToFen: PositionBook = {};

  for (const fen in openingBook) {
    const position = fen.split(" ")[0];

    positionToFen[position] ??= [];
    positionToFen[position].push(fen);
  }

  return positionToFen;
}

/**
 * Finds an opening by FEN with automatic fallback to position-only matching.
 * First tries exact FEN match, then falls back to position-only (ignoring turn, castling, en passant).
 *
 * @param openingBook - The complete opening collection
 * @param fen - The FEN string to look up (full or position-only)
 * @param positionBook - Optional position book for fallback lookup (created via getPositionBook)
 * @returns The opening if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const openings = await openingBook();
 * const posBook = getPositionBook(openings);
 *
 * // Exact match
 * const opening1 = findOpening(
 *   openings,
 *   "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
 *   posBook
 * );
 *
 * // Position-only match (different turn/castling but same position)
 * const opening2 = findOpening(
 *   openings,
 *   "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 5 3",
 *   posBook
 * );
 * // Both return the same opening: King's Pawn Opening
 * ```
 */
export function findOpening(
  openingBook: OpeningCollection,
  fen: string,
  positionBook?: PositionBook
): Opening | undefined {
  // Try exact FEN match first
  let opening = openingBook[fen];

  // Fallback to position-only match if available
  if (!opening && positionBook) {
    const position = fen.split(" ")[0];
    const posEntry = positionBook[position];
    if (posEntry && posEntry.length > 0) {
      opening = openingBook[posEntry[0]];
    }
  }

  return opening;
}
