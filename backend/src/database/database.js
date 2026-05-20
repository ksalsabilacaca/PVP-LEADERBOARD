const { Redis } = require('@upstash/redis');
const { createClient } = require('redis');
const mongoose = require('mongoose');

const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const connectRedis = async () => {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.warn("Upstash Redis belum dikonfigurasi. Endpoint othergame memakai MongoDB jika tersedia.");
        return;
    }
    try {
        await redisClient.ping();
        console.log("Upstash Redis connected successfully");
    } catch (err) {
        console.error("Failed to connect to Upstash Redis", err);
    }
};

const buildRedisClient = () => {
    if (process.env.REDIS_URL) {
        return createClient({ url: process.env.REDIS_URL });
    }
    return createClient({
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: Number(process.env.REDIS_DB) || 0
    });
};

const zombieRushRedis = buildRedisClient();
zombieRushRedis.on('error', (err) => {
    console.error('Redis ZombieRush error', err);
});

const connectZombieRushRedis = async () => {
    try {
        if (!zombieRushRedis.isOpen) {
            await zombieRushRedis.connect();
        }
        console.log('Redis ZombieRush terhubung');
    } catch (err) {
        console.error('Gagal terhubung ke Redis ZombieRush', err);
    }
};

const connectMongo = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pvp-leaderboard';
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
};

module.exports = {
    redisClient,
    connectRedis,
    zombieRushRedis,
    connectZombieRushRedis,
    connectMongo
};