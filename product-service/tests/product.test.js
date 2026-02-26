const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.collection('products').deleteMany({});
});

describe('Product Service', () => {
  const sampleProduct = {
    name: 'Test Widget',
    description: 'A widget for testing',
    price: 29.99
  };

  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('product-service');
    expect(res.body.status).toBe('healthy');
  });

  test('GET /api/products returns empty array initially', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/products creates a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send(sampleProduct);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(sampleProduct.name);
    expect(res.body.price).toBe(sampleProduct.price);
    expect(res.body._id).toBeDefined();
  });

  test('GET /api/products returns created products', async () => {
    await request(app).post('/api/products').send(sampleProduct);
    await request(app).post('/api/products').send({ name: 'Another', description: 'Desc', price: 10 });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /api/products/:id returns a specific product', async () => {
    const created = await request(app).post('/api/products').send(sampleProduct);
    const res = await request(app).get(`/api/products/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(sampleProduct.name);
  });

  test('GET /api/products/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/products/batch returns products by ids', async () => {
    const p1 = await request(app).post('/api/products').send(sampleProduct);
    const p2 = await request(app).post('/api/products').send({ name: 'Other', description: 'Desc', price: 15 });

    const res = await request(app)
      .post('/api/products/batch')
      .send({ ids: [p1.body._id, p2.body._id] });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('DELETE /api/products/:id deletes a product', async () => {
    const created = await request(app).post('/api/products').send(sampleProduct);
    const res = await request(app).delete(`/api/products/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted');

    const check = await request(app).get(`/api/products/${created.body._id}`);
    expect(check.status).toBe(404);
  });

  test('DELETE /api/products/:id returns 404 for invalid id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/products/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
