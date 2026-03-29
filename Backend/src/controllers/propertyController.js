import {pool} from '../config/db.js';
import { createProperty, deletePropertyById } from '../models/propertyModel.js';

export async function listProperties(req, res) {
  try {
    const properties = await pool.query(
      `
        SELECT id, title, image_url, location, price, bedrooms, bathrooms, total_area
        FROM properties
        ORDER BY title ASC
      `
    );

    return res.json({
      success: true,
      data: properties.rows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function addProperty(req, res) {
  try {
    const title = req.body.title;
    const location = req.body.location;
    const price = req.body.price;
    const bedrooms = req.body.bedrooms ?? 1;
    const bathrooms = req.body.bathrooms ?? 1;
    const totalArea = req.body.total_area ?? 1;
    const imageUrlFromBody = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    if (!location) return res.status(400).json({ success: false, message: 'Location is required' });
    if (price === undefined || price === null) return res.status(400).json({ success: false, message: 'Price is required' });
    if (!req.file && !imageUrlFromBody) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // Auto-generate property ID
    const id = `PROP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const numericBedrooms = parseInt(bedrooms, 10);
    const numericBathrooms = parseInt(bathrooms, 10);
    const numericTotalArea = parseInt(totalArea, 10);

    if (!Number.isInteger(numericBedrooms) || numericBedrooms <= 0) {
      return res.status(400).json({ success: false, message: 'Bedrooms must be a positive integer' });
    }

    if (!Number.isInteger(numericBathrooms) || numericBathrooms <= 0) {
      return res.status(400).json({ success: false, message: 'Bathrooms must be a positive integer' });
    }

    if (!Number.isInteger(numericTotalArea) || numericTotalArea <= 0) {
      return res.status(400).json({ success: false, message: 'Total area must be a positive integer' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : imageUrlFromBody;

    const property = await createProperty({
      id,
      title,
      imageUrl: image_url,
      location,
      price: numericPrice,
      bedrooms: numericBedrooms,
      bathrooms: numericBathrooms,
      totalArea: numericTotalArea
    });

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ success: false, message: 'Property ID already exists' });
    }

    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function removeProperty(req, res) {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'Property ID is required' });
    }

    const deleted = await deletePropertyById(propertyId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
