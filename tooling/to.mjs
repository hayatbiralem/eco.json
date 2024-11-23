import { fromToOps, TO } from "./fromToOps.mjs";

export const to = (fen) => {
    try {
        const results = fromToOps(TO, fen, true);
        return results
    } catch (e) {
        console.error(e);
    } 
};
