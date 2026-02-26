const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// Mock the productClient BEFORE requiring app
jest.mock('../src/clients/productClient');
const { fetchProductsByIds } = require('../src/clients/productClient');

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
  await mongoose.connection.db.collection('orders').deleteMany({});
  jest.clearAllMocks();
});

describe('Order Service', () => {
  const mockProducts = [
    { _id: '6578a1b2c3d4e5f6a7b8c9d0', name: 'Widget', price: 25.00 },
    { _id: '6578a1b2c3d4e5f6a7b8c9d1', name: 'Gadget', price: 50.00 }
  ];

  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('order-service');
    expect(res.body.status).toBe('healthy');
  });

  test('POST /api/orders creates an order', async () => {
    fetchProductsByIds.mockResolvedValue(mockProducts);

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [
          { productId: mockProducts[0]._id, quantity: 2 },
          { productId: mockProducts[1]._id, quantity: 1 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.items[0].productName).toBe('Widget');
    expect(res.body.items[0].price).toBe(25.00);
    expect(res.body.totalAmount).toBe(100.00); // 25*2 + 50*1
    expect(fetchProductsByIds).toHaveBeenCalledWith([mockProducts[0]._id, mockProducts[1]._id]);
  });

  test('POST /api/orders returns 400 for empty items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  test('POST /api/orders returns 502 when product service unreachable', async () => {
    fetchProductsByIds.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: mockProducts[0]._id, quantity: 1 }]
      });
    expect(res.status).toBe(502);
  });

  test('POST /api/orders returns 400 when product not found', async () => {
    fetchProductsByIds.mockResolvedValue([]); // no products returned

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: 'nonexistent', quantity: 1 }]
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not found/i);
  });

  test('GET /api/orders/:id returns an order', async () => {
    fetchProductsByIds.mockResolvedValue([mockProducts[0]]);

    const created = await request(app)
      .post('/api/orders')
      .send({
        items: [{ productId: mockProducts[0]._id, quantity: 3 }]
      });

    const res = await request(app).get(`/api/orders/${created.body._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(created.body._id);
    expect(res.body.totalAmount).toBe(75.00); // 25*3
  });

  test('GET /api/orders/:id returns 404 for invalid order', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/orders/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
