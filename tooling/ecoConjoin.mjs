import { readJsonFile } from "./readJsonFile.mjs";
import { ecoCats } from "./const.mjs";
import fs from "fs";
import module from 'module'

// reconstitute the monolithic eco.json data from A, B, C, D, & E files (interpolated optional)

let ecoJson = {};

const conjoin = (cats, includeInterpolated = false) => {
    for (const cat of ecoCats) {
        const json = readJsonFile(`../eco${cat}.json`);
        ecoJson = { ...ecoJson, ...json };
    }

    if (includeInterpolated) {
        const json = readJsonFile(`../eco_interpolated.json`);
        ecoJson = { ...ecoJson, ...json };
    }

    return ecoJson;
};

if (module.children) {
    // command line action:
    conjoin(ecoCats);
    fs.writeFileSync("./eco.json", JSON.stringify(ecoJson, null, 2));
}

export { conjoin };
