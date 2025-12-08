/**
 * Source of the opening data.
 * eco_tsv is the authoritative source from lichess.
 */
export type OpeningSource =
  | "eco_tsv"
  | "eco_js"
  | "scid"
  | "eco_wikip"
  | "wiki_b"
  | "ct"
  | "chessGraph"
  | "chronos"
  | "icsbot"
  | "pgn"
  | "interpolated";

/**
 * ECO category (A-E)
 */
export type EcoCategory = "A" | "B" | "C" | "D" | "E";

/**
 * Opening variation record keyed by FEN position
 */
export interface Opening {
  /** Source of this opening data */
  src: OpeningSource;

  /** ECO code (e.g., "B03"). Not unique - many openings share the same ECO code */
  eco: string;

  /** Standard algebraic notation move sequence (e.g., "1. e4 Nf6 2. e5") */
  moves: string;

  /** Common English name of the opening */
  name: string;

  /** Alternative names from other sources */
  aliases?: Record<string, string>;

  /** Extended SCID code when applicable */
  scid?: string;

  /** True if this is the official ECO root variation for this code */
  isEcoRoot?: boolean;

  /** For interpolated openings: the original source of the root variation */
  rootSrc?: OpeningSource;
}

/**
 * Collection of openings keyed by FEN notation
 * FEN is the unique identifier for each position
 */
export interface OpeningCollection {
  [fen: string]: Opening;
}

/**
 * Opening transition in the fromTo graph
 * [from_fen, to_fen, from_source, to_source]
 */
export type OpeningTransition = [string, string, OpeningSource, OpeningSource];
