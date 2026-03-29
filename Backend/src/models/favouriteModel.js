import { pool } from '../config/db.js'

export async function createFavourite({ user_id, property_id }) {
    const result = await pool.query(
        `INSERT INTO favourites (user_id, property_id) 
        VALUES ($1, $2)
        RETURNING id, user_id, property_id, created_at
        `,
        [user_id, property_id]
    );
    return result.rows[0];
}

export async function getFavouritesByUserId(user_id) {
    const result = await pool.query(
        `SELECT 
        f.id, 
        f.user_id, 
        f.property_id, 
        f.created_at,
        p.title, 
        p.image_url, 
        p.price, 
        p.location,
        p.bedrooms,
        p.bathrooms,
        p.total_area
        FROM favourites f
        INNER JOIN properties p ON p.id = f.property_id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC`,
        [user_id]
    );
    return result.rows;
}

export async function deleteFavourite(userId, propertyId) {
    const result = await pool.query(
        `DELETE FROM favourites 
        WHERE user_id = $1 AND property_id = $2
        RETURNING id
        `,
        [userId, propertyId]
    );
  return Boolean(result.rows[0]);
}