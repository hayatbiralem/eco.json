import { fromToOps, FROM } from "./fromToOps.mjs";

export const from = (fen) => {
    try {
        const results = fromToOps(FROM, fen, true);
        return results;
    } catch (e) {
        console.error(e);
    }
};
