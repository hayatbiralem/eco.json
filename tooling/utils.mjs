import path from "path";

// useful for determining full paths to a file

const dirname = (folder) => new URL(folder, import.meta.url).pathname;

const filePath = (folder, filename) => {

    const dir = dirname(folder)
    const file = path.join(dir, filename);
    return file
}

export {dirname, filePath}