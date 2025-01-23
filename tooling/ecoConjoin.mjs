import { readJsonFile } from "./readJsonFile.mjs";
import { ecoCats } from "./const.mjs";
import fs from "fs";

// reconstitute the monolithic eco.json data from A, B, C, D, & E files (interpolated optional)

const thereIsNoSanityClause = (eco, interpolated) => {
    // check if interpolations are in main openings:
    Object.keys(interpolated).forEach((fen) => {
        if (eco[fen]) throw Error("eco.json contains an interpolation");
    });

    // check if main openings have interpolations:
    Object.keys(eco).forEach((fen) => {
        if (interpolated[fen]) throw Error("interpolation found in eco.json");
    });
};

let ecoJson = {};

const conjoin = ({
    cats = ecoCats,
    includeInterpolated = false,
    log = false,
    writeEcoJson = false
}) => {
    for (const cat of cats) {
        const json = readJsonFile(`../eco${cat}.json`);
        ecoJson = { ...ecoJson, ...json };
    }

    if (log) {
        console.log(Object.keys(ecoJson).length);
    }

    if (includeInterpolated) {
        const json = readJsonFile(`../eco_interpolated.json`);

        // this sanity check passes (11/27/2024):
        // thereIsNoSanityClause(ecoJson, json);

        ecoJson = { ...ecoJson, ...json };
        if (log) {
            console.log(Object.keys(ecoJson).length);
        }
    }

    if (writeEcoJson) {
        const inclInterpolated = process.argv[2] === "interpolated";
        // command line action:
        conjoin(ecoCats, inclInterpolated);
        console.log("writing eco.json")
        fs.writeFileSync("./eco.json", JSON.stringify(ecoJson, null, 2));
    }
    return ecoJson;
};


export { conjoin };
