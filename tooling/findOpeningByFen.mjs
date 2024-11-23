import { conjoin } from "./ecoConjoin.mjs";
import {from} from "./from.mjs"
import {to} from "./to.mjs"

const fens = process.argv.slice(2);

const allOpenings = conjoin({includeInterpolated: true});

fens.forEach(fen => {
    const {opening, ...from_} = from(fen)
    const {opening:_, ...to_} = to(fen)
    const result = {
        opening,
        from:from_.fromOpenings,
        to:to_.toOpenings
    }
    console.dir(result, {depth: 10})
    console.log("\n------\n")
})