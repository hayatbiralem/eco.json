import { readJsonFile } from "./readJsonFile.mjs";
import { ecoCats } from "./const.mjs";
import fs from 'fs'

// reconstitute the monolithic eco.json data from A, B, C, D, & E files

let ecoJson = {}

for (const cat of ecoCats) {
    const json = readJsonFile(`../eco${cat}.json`)
    ecoJson = {...ecoJson, ...json}
}

fs.writeFileSync('./eco.json', JSON.stringify(ecoJson, null, 2))