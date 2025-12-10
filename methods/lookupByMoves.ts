import type { Opening, OpeningCollection } from "../src/types.js";
import { findOpening, type PositionBook } from "./findOpening.js";

/**
 * Minimal interface that chess libraries must implement to use lookupByMoves.
 * Compatible with chess.js, @chess-pgn/chess-pgn, and similar libraries.
 */
export interface ChessGameLike {
  /** Returns the current position as a FEN string */
  fen(): string;

  /** Undoes the last move */
  undo(): void;

  /** Returns the move history */
  history(): string[] | any[];

  /** Loads a position from FEN */
  load(fen: string): void;
}

/**
 * Result of looking up an opening by moves
 */
export interface LookupByMovesResult {
  /** The opening found, or undefined if no opening matches */
  opening: Opening | undefined;

  /** Number of moves walked backward to find the opening (0 = exact match) */
  movesBack: number;
}

/**
 * Options for lookupByMoves
 */
export interface LookupByMovesOptions {
  /** Maximum number of moves to walk backward (default: all moves) */
  maxMovesBack?: number;

  /** Position book for fallback matching (optional, improves match rate) */
  positionBook?: PositionBook;
}

/**
 * Finds a chess opening by walking backward through move history.
 * Works with any chess library implementing the ChessGameLike interface.
 *
 * This function tries to find an opening match at the current position.
 * If no match is found, it undoes moves one by one and tries again,
 * allowing it to find the nearest named opening even when the current
 * position has moved beyond standard opening theory.
 *
 * The chess game state is restored to its original position after the search.
 *
 * @param chess - A chess game instance (chess.js, chessPGN, etc.)
 * @param openingBook - The opening collection to search
 * @param options - Search options (maxMovesBack, positionBook)
 * @returns Result containing the opening and number of moves walked back
 *
 * @example
 * ```typescript
 * import { ChessPGN } from '@chess-pgn/chess-pgn';
 * import { openingBook, lookupByMoves } from '@chess-openings/eco.json';
 *
 * const chess = new ChessPGN();
 * chess.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6');
 *
 * const result = lookupByMoves(chess, await openingBook());
 * console.log(result.opening?.name); // "Ruy Lopez"
 * console.log(result.movesBack);      // 0 (exact match)
 * ```
 *
 * @example
 * ```typescript
 * // Position beyond standard opening theory
 * chess.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5');
 *
 * const result = lookupByMoves(chess, await openingBook(), { maxMovesBack: 10 });
 * console.log(result.opening?.name); // "Ruy Lopez: Closed"
 * console.log(result.movesBack);      // 3 (walked back 3 moves to find opening)
 * ```
 */
export function lookupByMoves(
  chess: ChessGameLike,
  openingBook: OpeningCollection,
  options?: LookupByMovesOptions
): LookupByMovesResult {
  const startingFen = chess.fen();
  let movesBack = 0;
  const maxBack = options?.maxMovesBack ?? chess.history().length;

  try {
    // Try current position and walk backward
    while (movesBack <= maxBack) {
      const opening = findOpening(
        openingBook,
        chess.fen(),
        options?.positionBook
      );

      if (opening) {
        return { opening, movesBack };
      }

      // No more moves to undo
      if (chess.history().length === 0) {
        break;
      }

      chess.undo();
      movesBack++;
    }

    // No opening found
    return { opening: undefined, movesBack: 0 };
  } finally {
    // Always restore original position
    chess.load(startingFen);
  }
}
