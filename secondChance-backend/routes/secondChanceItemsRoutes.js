const express = require('express')
const multer = require('multer')
const router = express.Router()
const logger = require('../logger')
const removeNulls = require('../util/removeNulls.js')
const getCollection = require('../models/getCollection.js')

/**
 * @typedef {import('../types/secondChanceItems.d.ts').SecondChanceItem} SecondChanceItem
 * @typedef {import('mongodb').ObjectId} ObjectId
 * @typedef {SecondChanceItem & { _id: ObjectId }} SecondChanceItemWithId
*/

// Define the upload directory path
const directoryPath = 'public/images'

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath) // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Use the original file name
  }
})

const upload = multer({ storage })
const collectionName = 'secondChanceItems'

// Get all secondChanceItems
router.get('/', async (req, res, next) => {
  logger.info('/ called')
  try {
    const collection = await getCollection(collectionName)
    /** @type SecondChanceItem[] */
    const secondChanceItems = await collection.find({}).toArray()
    res.json(secondChanceItems)
  } catch (e) {
    logger.error('oops something went wrong', e)
    next(e)
  }
})

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const collection = await getCollection(collectionName)
    const lastItemQuery = collection.find().sort({ id: -1 }).limit(1)
    /**
     * @type {SecondChanceItem}
     */
    let secondChanceItem = req.body

    for await (const item of lastItemQuery) {
      secondChanceItem.id = (parseInt(item.id) + 1).toString()
    }
    const dateAdded = Math.floor(new Date().getTime() / 1000)
    secondChanceItem.date_added = dateAdded

    secondChanceItem = await collection.insertOne(secondChanceItem)
    console.log(secondChanceItem)
    res.status(201).json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const collection = await getCollection(collectionName)
    /** @type SecondChanceItemWithId */
    const secondChanceItem = await collection.findOne({ id })
    if (!secondChanceItem) throw new Error('Item not found')
    res.json(secondChanceItem)
  } catch (e) {
    next(e)
  }
})

// Update and existing item
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const newUpdate = req.body
    const image = req.file ? req.file.filename : null
    const collection = await getCollection(collectionName)

    const updatedItem = await collection.findOneAndUpdate(
      { id },
      { $set: removeNulls({ ...newUpdate, image }) },
      { returnOriginal: false }
    )
    if (!updatedItem) throw new Error('Item not found')
    res.status(201).json({ message: 'Item updated successfully', updatedItem })
  } catch (e) {
    next(e)
  }
})

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const collection = await getCollection(collectionName)
    const deletedItem = await collection.findOneAndDelete({ id })
    if (!deletedItem) throw new Error('Item not found')
    res.json({ message: 'Item deleted successfully', deletedItem })
  } catch (e) {
    next(e)
  }
})

module.exports = router
