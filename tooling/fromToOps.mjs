import {readJsonFile} from './readJsonFile.mjs'
import { conjoin } from './ecoConjoin.mjs';
import { ecoCats } from './const.mjs';

const FROM = 0
const TO = 1

const fromToOps = (fromOrTo, fen, includeInterpolated) => {
    if (!fen) {
        throw Error("Please supply a FEN argument")
    }

    const FENEX = /(?!.*\d{2,}.*)^([1-8PNBRQK]+\/){7}[1-8PNBRQK]+$/im;

    if (!FENEX.test(fen.split(' ')[0])) {
        throw Error("Invalid FEN string argument")
    }

    const fromToArray = readJsonFile('../fromTo.json')
    const allOpenings = conjoin(ecoCats, includeInterpolated)
    const opening = allOpenings[fen]

    if (fromOrTo === FROM) {
        const froms = fromToArray.filter(([, to]) => to === fen)
        const fromOpenings = froms.map(([from]) => allOpenings[from])
        return {opening, fromOpenings}
    } else if (fromOrTo === TO) {
        const tos = fromToArray.filter(([from,]) => from === fen)
        const toOpenings = tos.map(([, to]) => allOpenings[to])
        return {opening, toOpenings}
    } else {
        throw Error("must supply a fromOrTo argument")
    }
}

export {fromToOps, FROM, TO}