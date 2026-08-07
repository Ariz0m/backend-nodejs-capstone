const connectToDatabase = require("./db");

/**
 * Helper to get the collection inside each request (ensures fresh awaitable access)
 * @param {string} collectionName - The name of the collection to retrieve
 * @returns {Promise<import("mongodb").Collection>} The collection object for the specified collection
 */
module.exports = async function getCollection(collectionName) {
    const dbInstance = await connectToDatabase();
    return dbInstance.collection(collectionName);
}