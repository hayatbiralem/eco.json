import { conjoin } from "./ecoConjoin.mjs";

const allOpenings = conjoin({includeInterpolated:false})

const selectSources = () => {
    const sources = process.argv.slice(2, 99)

    const hits = Object.keys(allOpenings).reduce((acc, key)=> {
        const opening = allOpenings[key]
        const aliasSources = Object.keys(opening.aliases??={}).filter(aliasKey => sources.includes(aliasKey))
        if (sources.includes(opening.src)||aliasSources.length) {
            acc[key] = opening
        }
        return acc;
    }, {})

    return hits;
}

const antiSelectSources = () => {
    const source = process.argv[2]     // this function only expects one source argument; e.g. 'eco_tsv'

    const noHits = Object.keys(allOpenings).reduce((acc, key)=> {
        const opening = allOpenings[key]
        const aliasSource = Object.keys(opening.aliases??={}).find(aliasKey => source === aliasKey)
        if (source !== opening.src && !aliasSource ) {
            acc[key] = opening
        }
        return acc;
    }, {})

    return noHits;
}

if (module.children) {
    console.log(JSON.stringify(antiSelectSources(), null, 2))
}

export {selectSources, antiSelectSources}