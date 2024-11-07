
import {fromToOps, FROM} from './fromToOps.mjs'

try {
    const fen = process.argv[2]

    const results = fromToOps(FROM, fen, true)

    console.log(JSON.stringify(results,null,2))
} catch (e) {
    console.error(e)
}

