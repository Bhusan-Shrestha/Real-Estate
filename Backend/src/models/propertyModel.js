import {pool} from '../config/db.js';

export async function findpropertyById(propertyId){
    const result = await pool.query(
        `SELECT id, title, image_url, price, location, bedrooms, bathrooms, total_area, created_at 
        FROM properties 
        WHERE id = $1
        LIMIT 1`,
        [propertyId]
    );
    return result.rows[0];
}

export async function createProperty({ id, title, imageUrl, location, price, bedrooms, bathrooms, totalArea }) {
    const result = await pool.query(
        `INSERT INTO properties (id, title, image_url, location, price, bedrooms, bathrooms, total_area)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, title, image_url, location, price, bedrooms, bathrooms, total_area, created_at`,
        [id, title, imageUrl, location, price, bedrooms, bathrooms, totalArea]
    );

    return result.rows[0];
}

export async function deletePropertyById(propertyId) {
    const result = await pool.query(
        `DELETE FROM properties
         WHERE id = $1
         RETURNING id`,
        [propertyId]
    );

    return result.rows[0];
}