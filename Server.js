require('dotenv').config();
const express = require('express');
const app = express();
const authRouter = require('./Router/Auth_router'); // Import the router
const connectDb = require('./utils/db');
const cors = require("cors");
const path = require('path');
app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for routing
app.use("/", authRouter);

// Default route for undefined paths
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// Start the server
const PORT = 5000;
connectDb().then(async(db) => {
    const collections = await db.listCollections({name: 'Users'}).toArray();
    if(collections.length === 0) {
        console.log("Creating collection Users");
        db.createCollection('Users');
    }else{
        console.log("Collection Cadabra and Users already exists");
    }
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log("Error connecting to database", err);
});
