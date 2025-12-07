/**
 * @chess-openings/eco.json
 *
 * Read-only utilities for consuming chess opening data from the eco.json repository.
 * Opening data is downloaded on-demand from GitHub to keep the package size small.
 */

export * from "./types.js";
export { getLatestEcoJson, openingBook } from "../methods/getLatestEcoJson.js";
export {
  findOpening,
  getPositionBook,
  type PositionBook,
} from "../methods/findOpening.js";
export {
  getFromToIndex,
  getFromTos,
  clearFromToCache,
  type FromToIndex,
} from "../methods/fromTo.js";
