import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { listFavourites, addFavourite, removeFavourite } from '../controllers/favouriteController.js';

const router = express.Router();

router.use(authMiddleware)

router.get('/', listFavourites);
router.post('/:propertyId', addFavourite);
router.delete('/:propertyId', removeFavourite);

export default router;  