import path from "path";

export function resolveDirectory(dir) {
    return path.join(new URL("../../../", import.meta.url).pathname, dir);
}

export function resolveFile(dir, file) {
    return path.join(resolveDirectory(dir), file);
}