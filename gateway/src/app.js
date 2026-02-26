const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('short'));

app.get('/health', async (_req, res) => {
  const checks = {};
  try {
    const pRes = await fetch(`${PRODUCT_SERVICE_URL}/health`);
    checks.productService = pRes.ok ? 'healthy' : 'unhealthy';
  } catch {
    checks.productService = 'unreachable';
  }
  try {
    const oRes = await fetch(`${ORDER_SERVICE_URL}/health`);
    checks.orderService = oRes.ok ? 'healthy' : 'unhealthy';
  } catch {
    checks.orderService = 'unreachable';
  }

  const allHealthy = checks.productService === 'healthy' && checks.orderService === 'healthy';
  res.status(allHealthy ? 200 : 503).json({
    service: 'gateway',
    status: allHealthy ? 'healthy' : 'degraded',
    downstream: checks
  });
});

app.use('/api/products', createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/orders', createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true
}));

const clientBuild = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

module.exports = app;
