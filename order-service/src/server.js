const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3002;

const start = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Order service running on port ${PORT}`);
  });
};

start();
