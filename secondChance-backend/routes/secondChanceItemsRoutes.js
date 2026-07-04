const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const removeNulls = require('../util/removeNulls.js');

/**
 * @typedef {import('../types/secondChanceItems.d.ts').SecondChanceItem} SecondChanceItem
 * @typedef {import('mongodb').ObjectId} ObjectId
 * @typedef {SecondChanceItem & { _id: ObjectId }} SecondChanceItemWithId
*/

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });
const collectionName = 'secondChanceItems';
// Create a promise for the database connection
const dbPromise = connectToDatabase().catch((error) => {
    logger.error('Failed to connect to the database', error);
    throw error;
});

// Helper to get the collection inside each request (ensures fresh awaitable access)
async function getCollection() {
    const dbInstance = await dbPromise;
    return dbInstance.collection(collectionName);
}

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        /** @type SecondChanceItem[] */
        const secondChanceItems = (await getCollection()).find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', async(req, res,next) => {
    try {
        /** @type SecondChanceItem */
        const intendedItem = req.body;
        const image = req.file ? req.file.filename : null;
        intendedItem.image = image;
        
        const id = (await (await getCollection()).insertOne(intendedItem)).insertedId.toString();
        res.status(201).json({message: 'Item added successfully', id});
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        /** @type SecondChanceItemWithId */
        const secondChanceItem = await (await getCollection()).findOne({ id });
        if (!secondChanceItem) throw new Error('Item not found');
        res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        const { id } = req.params;
        const newUpdate = req.body;
        const image = req.file ? req.file.filename : null;


        const updatedItem = await (await getCollection()).findOneAndUpdate(
            { id },
            { $set: removeNulls({ ...newUpdate, image }) },
            { returnOriginal: false }
        );
        if (!updatedItem) throw new Error('Item not found');
        res.status(201).json({ message: 'Item updated successfully', updatedItem });
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async(req, res, next) => {
    try {
        const { id } = req.params;
        const deletedItem = await (await getCollection()).findOneAndDelete({ id });
        if (!deletedItem) throw new Error('Item not found');
        res.json({ message: 'Item deleted successfully', deletedItem });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
