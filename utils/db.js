const mongoose = require('mongoose');

// const URI = "mongodb://localhost:27017/mern_admin";

const URI = process.env.MONGODB_URI;

const connectDb =async ()=>{
    try {
        await mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Database connection successful!");
        return mongoose.connection.db; // Return the native MongoDB database connection
    } catch (error) {
        console.error("database connection failled");
        process.exit(0);
    }
};

module.exports =connectDb;