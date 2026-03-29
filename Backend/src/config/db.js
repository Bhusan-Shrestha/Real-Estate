import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let pool = null;

async function createDatabaseIfNotExists() {
    try {
        // Connect to default postgres database to create our database
        const tempPool = new pg.Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'postgres'
        });

        // Check if database exists
        const result = await tempPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [process.env.DB_NAME]
        );

        if (result.rows.length === 0) {
            console.log(`Creating database: ${process.env.DB_NAME}...`);
            await tempPool.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`Database ${process.env.DB_NAME} created successfully`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists`);
        }

        await tempPool.end();
    } catch (err) {
        console.error('Error creating database:', err);
        throw err;
    }
}

function initializePool() {
    if (!pool) {
        pool = new pg.Pool({
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
    }
    return pool;
}

async function initializeDatabase() {
    try {
        // Create database first if it doesn't exist
        await createDatabaseIfNotExists();

        // Initialize pool connection
        const connPool = initializePool();

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
        console.log('Database and tables initialized successfully');

    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
}

async function seedAdminUser() {
    //create admin user if it doesn't exist
    if (process.env.ADMIN_NAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const connPool = initializePool();
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

function getPool() {
    return initializePool();
}

export { getPool as pool, initializeDatabase, seedAdminUser };