import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRouter.js';
import favouriteRoutes from './routes/favouritesRouters.js';
import propertiesRoutes from './routes/propertyRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy' });
});

app.use('/auth', authRoutes);
app.use('/favourites', favouriteRoutes);
app.use('/properties', propertiesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
 