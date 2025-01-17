const { redisClient } = require('./redisTest'); // Adjust path to Server.js

const testRedis = async (req, res) => {
    try {
        const key = 'test:key';
        const value = 'test-value';

        // Store a value with TTL
        await redisClient.setEx(key, 60, value); // TTL: 60 seconds
        console.log(`Set ${key} = ${value}`);

        // Retrieve the value
        const result = await redisClient.get(key);
        console.log(`Retrieved ${key} = ${result}`);

        res.status(200).json({ message: `Redis test successful: ${result}` });
    } catch (err) {
        console.error('Redis test failed:', err);
        res.status(500).json({ message: 'Redis test failed.', error: err.message });
    }
};

module.exports = { testRedis };
