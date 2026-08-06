const router = require("express").Router();
const getCollection = require("../models/getCollection");
const logger = require("../logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const removeNulls = require("../util/removeNulls");
const requireString = require("../util/requireString");
const { body ,validationResult } = require("express-validator")

/**
 * @typedef {import('../types/user.d.ts').User} User
 * @typedef {import('../types/user.d.ts').UserWithId} UserWithId
 */

const USER_COLLECTION_NAME = "users";

router.post("/register", async (req, res) => {
    const USER_COLLECTION = await getCollection(USER_COLLECTION_NAME);

    /**
    * @type User
    */
    const body = req.body;
    const { email, password, firstName, lastName } = body;

    if (!email) {
        logger.error("Email was not provided in the request body");
        return res.status(400).json({error: "Email is required"});
    }

    if (!password) {
        logger.error("Password was not provided in the request body");
        return res.status(400).json({error: "Password is required"});
    }

    const existingEmail = await USER_COLLECTION.findOne({ email });

    if (existingEmail) {
        logger.error(`Email ${email} was already registered`);
        // Another solution could also be redirect to account recovery or login
        return res.status(400).json({error: "Email is already registered"});
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const newUser = await USER_COLLECTION.insertOne({
        email,
        password: hash,
        firstName,
        lastName,
        createdAt: new Date()
    });

    const payload = {
       user: {
        id: newUser.insertedId
       } 
    }

    const authToken = jwt.sign(payload, JWT_SECRET);

    logger.info(`User ${email} registered successfully`);
    res.status(201).json({ email, authToken });
});

router.post("/login", async (req, res) => {
    const USER_COLLECTION = await getCollection(USER_COLLECTION_NAME);
    /**
    * @type User
    */
    const body = req.body;
    const { email, password } = body;

    if (!email || !password) {
        logger.error("Email or password was not provided in the request body");
        return res.status(400).json({error: "Email and password are required"});
    }

    /**
    * @type UserWithId
    */
    const user = await USER_COLLECTION.findOne({ email });
    if (!user) {
        logger.error(`User with email ${email} not found`);
        return res.status(400).json({error: "Invalid credentials"});
    }


    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        logger.error(`Invalid password for user ${email}`);
        return res.status(400).json({error: "Invalid credentials"});
    }

    const payload = {
        user: {
            id: user._id.toString()
        }
    };

    const authToken = jwt.sign(payload, JWT_SECRET);

    logger.info(`User ${email} logged in successfully`);
    res.status(200).json({ email, firstName: user.firstName, authToken });
});

router.put("/update", async (req, res) => {
    const errors = validationResult(req);

	if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.headers;

    if (!email) {
        logger.error('Email not found in the request headers');
        return res.status(400).json({ error: "Email not found in the request headers" });
	}

	const USER_COLLECTION = await getCollection(USER_COLLECTION_NAME);

    const existingUser = await USER_COLLECTION.findOne({ email });

    if (!existingUser) {
        logger.error('User not found');
        return res.status(404).json({ error: "User not found" });
    }

    existingUser.firstName = requireString(req.body.firstName);
    existingUser.updatedAt = new Date();

    const updatedUser = await USER_COLLECTION.updateOne(
        { email },
        { $set: existingUser },
        { returnDocument: 'after' }
    );

    const payload = {
        user: {
            id: existingUser._id.toString(),
        },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);
    logger.info('User updated successfully');

    res.status(200).json({ userName: existingUser.firstName, userEmail: existingUser.email, authtoken });
});

module.exports = router;