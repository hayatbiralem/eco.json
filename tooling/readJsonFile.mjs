import fs from 'fs'
import { filePath } from './utils.mjs';

// reads a JSON file and returns a JSON object or array

const readJsonFile = (fileName, logIt=false) => {
    const file = filePath(".", fileName)
    const strbuf = fs.readFileSync(file);

    const openings = JSON.parse(strbuf);

    logIt && console.log("Read in", Object.keys(openings).length, "records");
    return openings;
};

export { readJsonFile }