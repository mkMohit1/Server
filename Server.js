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
const redis = require('redis'); // Redis client
const RedisStore = require('connect-redis')(session); // Use this for version 6.x

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

global.io = io;
global.superAdminSocket = null;

const redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    },
    legacyMode: true,
  });
  
  const initializeRedis = async () => {
    try {
      await redisClient.connect();
      console.log('Redis client connected successfully');
    } catch (error) {
      console.error('Error connecting Redis client:', error);
    }
  };
  
initializeRedis();
  

app.use(cors({
    origin: '*', // Allow requests from this origin
    credentials: true,              // Allow cookies and credentials
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }), // Correctly initialize RedisStore for 6.x
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for routing
app.use("/", authRouter);

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Identify super admin
    socket.on('supperAdminLogin', () => {
        global.superAdminSocket = socket;
        console.log('Supper Admin logged in', socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket === global.superAdminSocket) {
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
const PORT = process.env.PORT || 5000;
connectDb().then(async (db) => {
    const collections = await db.listCollections({ name: 'Users' }).toArray();
    if (collections.length === 0) {
        console.log("Creating collection Users");
        await db.createCollection('Users');
    } else {
        console.log("Collection Users already exists");
    }
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to database:", err);
});
//console.log("erddsgfvdsfs",redisClient);
module.exports = redisClient;