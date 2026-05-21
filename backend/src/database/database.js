const { createClient } = require('redis');
const { Pool } = require('pg');

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

const connectionString = process.env.DATABASE_URL;
let pgPool;
if (connectionString) {
    const isNeon = connectionString.includes('neon.tech');
    pgPool = new Pool({
        connectionString,
        ssl: isNeon ? { rejectUnauthorized: false } : (process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false)
    });
} else {
    pgPool = new Pool();
}

const connectPostgres = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL tidak terdefinisi di environment");
        }
        // Test connection
        await pgPool.query('SELECT NOW()');
        console.log("PostgreSQL terhubung");

        // Table creation
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS othergame_scores (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                score INTEGER NOT NULL
            );
        `);
        console.log("Tabel othergame_scores dipastikan ada");
    } catch (err) {
        console.error("Gagal terhubung ke PostgreSQL. Endpoint othergame tidak dapat digunakan.", err.message);
    }
};

module.exports = {
    zombieRushRedis,
    connectZombieRushRedis,
    pgPool,
    connectPostgres
};