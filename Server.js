require('dotenv').config();
const express = require('express');
const app = express();
const authRouter = require('./Router/Auth_router'); // Import the router
const connectDb = require('./utils/db');
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Middleware for routing
app.use("/", authRouter);

// Default route for undefined paths
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// Start the server
const PORT = 5000;
connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
