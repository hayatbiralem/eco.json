import type { Opening, OpeningCollection } from "../src/types.js";
import { openingBook } from "./getLatestEcoJson.js";

/**
 * Returns all openings for a specific ECO code.
 * Note: Multiple openings can share the same ECO code (it's a category, not a unique identifier).
 *
 * @param ecoCode - The ECO code to filter by (e.g., "B12", "C42")
 * @param openings - Optional pre-loaded opening collection (fetched via openingBook() if not provided)
 * @returns Array of openings matching the ECO code
 *
 * @example
 * ```typescript
 * // Get all Caro-Kann Defense variations
 * const caroKann = await getOpeningsByEco("B12");
 * console.log(`Found ${caroKann.length} variations`);
 * caroKann.forEach(o => console.log(o.name, o.moves));
 * ```
 */
export async function getOpeningsByEco(
  ecoCode: string,
  openings?: OpeningCollection
): Promise<Opening[]> {
  const book = openings || (await openingBook());

  return Object.values(book).filter((opening) => opening.eco === ecoCode);
}

/**
 * Returns all openings for a specific ECO category (A, B, C, D, or E).
 *
 * @param category - The ECO category letter ("A", "B", "C", "D", or "E")
 * @param openings - Optional pre-loaded opening collection (fetched via openingBook() if not provided)
 * @returns Array of openings in the category
 *
 * @example
 * ```typescript
 * // Get all semi-open games (category B)
 * const semiOpen = await getOpeningsByEcoCategory("B");
 * console.log(`Found ${semiOpen.length} openings in category B`);
 *
 * // With pre-loaded book (more efficient for multiple queries)
 * const book = await openingBook();
 * const catA = await getOpeningsByEcoCategory("A", book);
 * const catB = await getOpeningsByEcoCategory("B", book);
 * ```
 */
export async function getOpeningsByEcoCategory(
  category: string,
  openings?: OpeningCollection
): Promise<Opening[]> {
  const book = openings || (await openingBook());
  const upperCategory = category.toUpperCase();

  if (!["A", "B", "C", "D", "E"].includes(upperCategory)) {
    throw new Error(
      `Invalid ECO category: ${category}. Must be A, B, C, D, or E.`
    );
  }

  return Object.values(book).filter((opening) =>
    opening.eco?.startsWith(upperCategory)
  );
}

/**
 * Returns only the canonical ECO root variations (where isEcoRoot === true).
 * These are the "official" variations defined in the Encyclopedia of Chess Openings.
 *
 * @param openings - Optional pre-loaded opening collection (fetched via openingBook() if not provided)
 * @returns Object mapping FEN to root opening (preserves FEN keys for lookup)
 *
 * @example
 * ```typescript
 * // Get all canonical ECO variations
 * const roots = await getEcoRoots();
 * console.log(`Found ${Object.keys(roots).length} ECO root variations`);
 *
 * // Check if a position is an ECO root
 * const fen = "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2";
 * if (roots[fen]) {
 *   console.log(`${roots[fen].name} (${roots[fen].eco}) is an ECO root`);
 * }
 * ```
 */
export async function getEcoRoots(
  openings?: OpeningCollection
): Promise<OpeningCollection> {
  const book = openings || (await openingBook());

  return Object.entries(book)
    .filter(([, opening]) => (opening as any).isEcoRoot === true)
    .reduce((acc, [fen, opening]) => {
      acc[fen] = opening;
      return acc;
    }, {} as OpeningCollection);
}
