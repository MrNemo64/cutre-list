import crypto from "crypto";

/**
 * @param {string} str 
 * @returns {string}
 */
export function encrypt(str) {
    const hash = crypto.createHash(process.env.PASS_HAS);
    hash.update(str);
    return hash.digest(process.env.PASS_HAS_DIGEST);
}