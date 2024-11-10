
import {fromToOps, TO} from './fromToOps.mjs'

try {
    const fen = process.argv[2]

    const results = fromToOps(TO, fen, true)

    console.log(JSON.stringify(results,null,2))
} catch (e) {
    console.error(e)
}

