const router = require("express").Router();
const getCollection = require("../models/getCollection.js");
const logger = require("../logger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const USER_COLLECTION_NAME = "users";

router.post("/register", async (req, res) => {
    const USER_COLLECTION = await getCollection(USER_COLLECTION_NAME);

    /**
    * @type {import('../types/user.d.ts').User}
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
        lastName
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
    * @type {import('../types/user.d.ts').User}
    */
    const body = req.body;
    const { email, password } = body;

    if (!email || !password) {
        logger.error("Email or password was not provided in the request body");
        return res.status(400).json({error: "Email and password are required"});
    }

    /**
    * @type {import('../types/user.d.ts').UserWithId}
    */
    const { firstName, ...user } = await USER_COLLECTION.findOne({ email });

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
    res.status(200).json({ email, firstName, authToken });
});

module.exports = router;