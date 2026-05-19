const { Redis } = require('@upstash/redis');
const mongoose = require('mongoose');

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const connectRedis = async () => {
    try {
        await redisClient.ping();
        console.log("Upstash Redis connected successfully");
    } catch (err) {
        console.error("Failed to connect to Upstash Redis", err);
    }
};

const connectMongo = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/pvp-leaderboard');
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
};

module.exports = { redisClient, connectRedis, connectMongo };