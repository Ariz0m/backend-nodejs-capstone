const router = require('express').Router();
const connectToDatabase = require('../models/db');
const removeNulls = require('../util/removeNulls');

/**
 * @typedef {import('../types/secondChanceItems.d.ts').SecondChanceItemWithId} SecondChanceItemWithId
*/

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
        // Task 1: Connect to MongoDB using connectToDatabase database. Remember to use the await keyword and store the connection in `db`
        const db = await connectToDatabase();

        const collection = db.collection("secondChanceItems");

        // Initialize the query object
        const query = removeNulls(req.query);

        // Add the name filter to the query if the name parameter is not empty
        if (req.query.name) query.name = { $regex: req.query.name, $options: "i" };

        if (req.query.age_years) query.age_years = { $lte: parseInt(req.query.age_years) };

        // Task 4: Fetch filtered gifts using the find(query) method. Make sure to use await and store the result in the `gifts` constant]
        /** @type SecondChanceItemWithId[] */
        const gifts = await collection.find(query).toArray();

        res.json(gifts);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
