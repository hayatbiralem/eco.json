import { readJsonFile } from "./readJsonFile.mjs";
import { ecoCats } from "./const.mjs";
import fs from "fs";
import module from 'module'

// reconstitute the monolithic eco.json data from A, B, C, D, & E files (interpolated optional)

let ecoJson = {};

const conjoin = (cats, includeInterpolated = false) => {
    for (const cat of cats) {
        const json = readJsonFile(`../eco${cat}.json`);
        ecoJson = { ...ecoJson, ...json };
    }

    if (includeInterpolated) {
        const json = readJsonFile(`../eco_interpolated.json`);
        ecoJson = { ...ecoJson, ...json };
    }

    return ecoJson;
};

if (!module.children) {
    const inclInterpolated = (process.argv[2] === "interpolated")
    // command line action:
    conjoin(ecoCats, inclInterpolated);
    fs.writeFileSync("./eco.json", JSON.stringify(ecoJson, null, 2));
}

const conjoin2 = ({cats=ecoCats, includeInterpolated=false}) => {
    return conjoin(cats, includeInterpolated)
}


export { conjoin, conjoin2 };
