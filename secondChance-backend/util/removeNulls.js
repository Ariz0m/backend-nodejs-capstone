/**
 * Removes null and undefined values from an object
 * @param {{}} obj Object to remove nulls
 */
module.exports = function removeNulls(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value != null)
    );
}
