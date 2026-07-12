/*jshint esversion: 8 */
const process = require("process");
const express = require('express');
const cors = require('cors');
const logger = require('./logger');

const connectToDatabase = require('./models/db');
const { loadData } = require("./util/import-mongo/index");
const secondChanceItemsRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');

process.loadEnvFile();
const app = express();
app.use("*",cors());
const PORT = 3060;

// Connect to MongoDB; we just do this one time
connectToDatabase().then(() => {
    logger.info('Connected to DB');
})
    .catch((e) => console.error('Failed to connect to DB', e));


app.use(express.json());

// Route files

// authRoutes Step 2: import the authRoutes and store in a constant called authRoutes
//{{insert code here}}



const { pinoHttp } = require('pino-http');

app.use(pinoHttp({ logger }));

// Use Routes
// authRoutes Step 2: add the authRoutes and to the server by using the app.use() method.
//{{insert code here}}

// Items API Task 2: add the secondChanceItemsRoutes to the server by using the app.use() method.
app.use("/api/secondchance/items", secondChanceItemsRoutes);

// Search API Task 2: add the searchRoutes to the server by using the app.use() method.
app.use("/api/secondchance/search", searchRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
});

app.get("/",(req,res)=>{
    res.send("Inside the server")
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
