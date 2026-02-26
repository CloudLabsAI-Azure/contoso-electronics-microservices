const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orders');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('short'));
app.use(express.json());

app.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    service: 'order-service',
    status: dbReady ? 'healthy' : 'unhealthy',
    db: dbReady ? 'connected' : 'disconnected'
  });
});

app.use('/api/orders', orderRoutes);

app.use(errorHandler);

module.exports = app;
