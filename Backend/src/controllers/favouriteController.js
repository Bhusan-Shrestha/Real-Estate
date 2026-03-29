import { createFavourite, deleteFavourite, getFavouritesByUserId } from '../models/favouriteModel.js';
import { findpropertyById } from '../models/propertyModel.js';
import { validateFavouritePayload } from '../utils/validators.js';


export async function listFavourites(req, res) {
    try {
        const favourites = await getFavouritesByUserId(req.user.id);
        return res.json({
            success: true,
            data: favourites
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function addFavourite(req, res) {
    try {
        const { propertyId } = req.body;
        const validationError = validateFavouritePayload({ propertyId });

        if (!validationError.valid) {
            return res.status(400).json({ success: false, message: validationError.message });
        }

        const property = await findpropertyById(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const favourite = await createFavourite(req.user.id, propertyId);
        if (!favourite) {
            return res.status(409).json({ success: false, message: 'Property already in favourites' });
        }

        return res.status(201).json({
            success: true,
            message: 'Property added to favourites',
            data: favourite
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function removeFavourite(req, res) {
    try{
        const { propertyId } = req.params;
        if (!propertyId) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }
        const deleted = await deleteFavourite(req.user.id, propertyId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Favourite not found' });
        }
        return res.json({
            success: true,
            message: 'Property removed from favourites'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}