import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

 const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


async function initializeDatabase() {
    try {
        // Initialize pool connection
        const connPool = pool;

        await connPool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

        // Create users table if it doesn't exist
        await connPool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'buyer',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        //create properties table if it doesn't exist
        await connPool.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                price DECIMAL(12, 2) NOT NULL,
                bedrooms INTEGER NOT NULL DEFAULT 1,
                bathrooms INTEGER NOT NULL DEFAULT 1,
                total_area INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        //create favourites table if it doesn't exist
        await connPool.query(`
            CREATE TABLE IF NOT EXISTS favourites (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL,
                property_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
                UNIQUE(user_id, property_id)
            );
        `);
        console.log('Database tables initialized successfully');

    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}

async function seedAdminUser() {
    //create admin user if it doesn't exist
    if (process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const connPool = pool;
        await connPool.query(
            `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, 'admin')
                ON CONFLICT (email) DO UPDATE
                SET password = $3, role = 'admin'
                `,
            [process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, adminPasswordHash]
        );
    } else {
        console.warn('Admin seed skipped: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing.');
    }
}


export { pool, initializeDatabase, seedAdminUser };