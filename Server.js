// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Server } = require('socket.io');
const authRouter = require('./Router/Auth_router'); // Importing the routes
const connectDb = require('./utils/db');
const cors = require("cors");
const path = require('path');
const http = require('http');

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin:"http://localhost:3000",
        methods:['GET','POST']
    }
});

global.io = io;
global.superAdminSocket = null;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for routing
app.use("/", authRouter);

// Handle WebSocket connections
io.on('connection', (socket)=>{
    console.log('A user connected:', socket.id);
    // Identify super admin
    socket.on('supperAdminLogin',()=>{
        global.superAdminSocket =socket;
        console.log('Supper Admin logged in',socket.id);
    });

    // Handle disconnection
    socket.on('disconnect',()=>{
        if(socket === global.superAdminSocket){
            global.superAdminSocket = null;
            console.log('Supper Admin disconnected');
        }
    });
});

// Default route for undefined paths
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// Start the server
const PORT = 5000;
connectDb().then(async (db) => {
    const collections = await db.listCollections({ name: 'Users' }).toArray();
    if (collections.length === 0) {
        console.log("Creating collection Users");
        db.createCollection('Users');
    } else {
        console.log("Collection Users already exists");
    }
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log("Error connecting to database", err);
});
