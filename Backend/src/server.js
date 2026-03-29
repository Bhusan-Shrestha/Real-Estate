import 'dotenv/config';
import app from './app.js';
import { initializeDatabase, seedAdminUser } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
