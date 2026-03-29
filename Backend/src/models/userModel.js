import {pool} from '../config/db.js';

export async function createUser({name, email, password, role = 'buyer'}) {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
        VALUES ($1, $2, $3, $4)
        Returning id, name, email, role, created_at
        `,
        [name, email, password, role]
    );
    return result.rows[0];
}

export async function getUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, name, email, password, role, created_at 
        FROM users 
        WHERE email = $1
        LIMIT 1`,
        [email]
    );
    return result.rows[0];
}