const { createClient } = require('redis');
const mongoose = require('mongoose');

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
        console.log("MongoDB terhubung");
    } catch (err) {
        console.error("Gagal terhubung ke MongoDB. Endpoint othergame tidak dapat digunakan.", err.message);
    }
};

module.exports = {
    zombieRushRedis,
    connectZombieRushRedis,
    connectMongo
};