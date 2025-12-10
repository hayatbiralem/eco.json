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

/**
 * Minimal interface that chess libraries must implement to use lookupByMoves.
 * Compatible with chess.js, @chess-pgn/chess-pgn, and similar libraries.
 */
export interface ChessGameLike {
  /** Returns the current position as a FEN string */
  fen(): string;

  /** Undoes the last move. Returns null/false/throws when no moves to undo. */
  undo(): unknown;

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
  /** Maximum number of moves to walk backward (default: 50 plies / move 25) */
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
  const startPly = options?.maxMovesBack ?? 50; // Start searching at ply 50 (move 25)

  try {
    // Extract move number and turn from FEN (e.g., "rnbq... w KQkq - 0 45")
    const fenParts = startingFen.split(" ");
    const moveNumber = parseInt(fenParts[5] || "1", 10);
    const isWhiteTurn = fenParts[1] === "w";

    // Calculate current ply: (moveNumber - 1) * 2 + (isWhiteTurn ? 0 : 1)
    const currentPly = (moveNumber - 1) * 2 + (isWhiteTurn ? 0 : 1);

    // If game is longer than startPly, undo back to startPly
    if (currentPly > startPly) {
      for (let i = 0; i < currentPly - startPly; i++) {
        chess.undo();
      }
    }

    // Now walk backward from startPly (or current position if shorter)
    let movesBack = currentPly > startPly ? currentPly - startPly : 0;

    while (true) {
      const opening = findOpening(
        openingBook,
        chess.fen(),
        options?.positionBook
      );

      if (opening) {
        return { opening, movesBack };
      }

      // Try to undo - if it fails/returns falsy, no more moves
      const undoResult = chess.undo();
      if (undoResult === null || undoResult === false) {
        break;
      }

      movesBack++;
    }

    // No opening found
    return { opening: undefined, movesBack: 0 };
  } catch (e) {
    // Some libraries throw when undo() is called with no moves
    // Return no opening found
    return { opening: undefined, movesBack: 0 };
  } finally {
    // Always restore original position
    chess.load(startingFen);
  }
}
