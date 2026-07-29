/**
 * Validates that the input is a non-empty string.
 * @param {string} str - The string to validate.
 * @returns {string} The validated string if it is a non-empty string.
 * @throws {Error} If the input is not a string or is an empty string.
 */
module.exports = function requireString(str) {
    if (typeof str !== "string") {
        throw new Error("Input must be a string");
    }
    if (str.trim() === "") {
        throw new Error("Input cannot be an empty string");
    }
    return str;
}