const app = require('./app');
const connectDB = require('./config/db');
const seedProducts = require('./config/seed');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  await seedProducts();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Product service running on port ${PORT}`);
  });
};

start();
