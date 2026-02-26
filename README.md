# Contoso Electronics — Microservices Edition

A microservices version of the Contoso Electronics e-commerce demo, decomposed from the monolithic architecture into independently deployable services.

## Architecture

```
┌────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client   │────▶│     Gateway      │────▶│ Product Service  │
│  (React)   │     │  (port 3000)     │     │   (port 3001)    │
└────────────┘     │  - Proxy routing  │     │   - CRUD ops     │
                   │  - Static files   │     │   - Batch lookup │
                   │  - Health agg.    │     │   - Own MongoDB  │
                   └──────┬───────────┘     └─────────────────┘
                          │
                          └───────────────▶┌─────────────────┐
                                           │  Order Service   │
                                           │   (port 3002)    │
                                           │  - Create/Get    │
                                           │  - Calls Product │
                                           │    Service       │
                                           │  - Own MongoDB   │
                                           └─────────────────┘
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| **gateway** | 3000 | API Gateway — proxies requests, serves React build, aggregates health checks |
| **product-service** | 3001 | Product catalog CRUD + batch lookup for inter-service calls |
| **order-service** | 3002 | Order creation (calls product-service for price validation) and retrieval |
| **client** | — | React 18 SPA, built and served by the gateway as static files |

### Key Design Decisions

- **Database per service**: Each service has its own MongoDB database (`contoso_products`, `contoso_orders`)
- **Denormalized orders**: Order items store `productName` and `price` at order time (no cross-service joins)
- **Synchronous inter-service communication**: Order service calls product service via HTTP for price validation
- **API Gateway pattern**: All client traffic routes through the gateway; no direct client-to-service calls

## Project Structure

```
Microservices/
├── client/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── pages/           # Home, Admin, Cart, OrderConfirm
│   │   ├── api.js           # API client (relative /api/* calls)
│   │   ├── CartContext.js    # Cart state management
│   │   ├── App.js           # Router + layout
│   │   └── index.css        # Styles
│   └── package.json
├── product-service/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/Product.js
│   │   ├── controllers/productController.js
│   │   ├── routes/products.js
│   │   ├── middleware/errorHandler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/product.test.js
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/Order.js
│   │   ├── clients/productClient.js
│   │   ├── controllers/orderController.js
│   │   ├── routes/orders.js
│   │   ├── middleware/errorHandler.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/order.test.js
│   ├── Dockerfile
│   └── package.json
├── gateway/
│   ├── src/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
├── docker-compose.yml
├── Dockerfile.gateway
└── README.md
```

## Quick Start

### With Docker Compose (recommended)

```bash
docker-compose up --build
```

Open http://localhost:3000

### Without Docker (local development)

**Prerequisites**: Node.js 20+, MongoDB running on `localhost:27017`

```bash
# Install all dependencies
cd product-service && npm install && cd ..
cd order-service && npm install && cd ..
cd gateway && npm install && cd ..
cd client && npm install && cd ..

# Build the React client
cd client && npm run build && cd ..

# Copy the build to gateway
cp -r client/build gateway/public

# Start services (each in a separate terminal)
cd product-service && MONGO_URI=mongodb://localhost:27017/contoso_products npm start
cd order-service && MONGO_URI=mongodb://localhost:27017/contoso_orders PRODUCT_SERVICE_URL=http://localhost:3001 npm start
cd gateway && PRODUCT_SERVICE_URL=http://localhost:3001 ORDER_SERVICE_URL=http://localhost:3002 npm start
```

## API Endpoints

### Product Service (via Gateway on :3000)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create a product |
| DELETE | `/api/products/:id` | Delete a product |
| POST | `/api/products/batch` | Get products by IDs (internal) |

### Order Service (via Gateway on :3000)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/:id` | Get order by ID |

### Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET :3000/health` | Gateway + aggregated downstream status |
| `GET :3001/health` | Product service health |
| `GET :3002/health` | Order service health |

## Running Tests

```bash
# Product service tests (9 tests)
cd product-service && npm test

# Order service tests (6 tests, mocks product client)
cd order-service && npm test
```

## Environment Variables

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `PORT` | All | 3000/3001/3002 | Service port |
| `MONGO_URI` | product/order | `mongodb://localhost:27017/contoso_*` | MongoDB connection string |
| `PRODUCT_SERVICE_URL` | order/gateway | `http://localhost:3001` | Product service base URL |
| `ORDER_SERVICE_URL` | gateway | `http://localhost:3002` | Order service base URL |

## Azure Deployment

For Azure deployment, replace `MONGO_URI` with your **Azure Cosmos DB (MongoDB API)** connection string. The wire protocol is fully compatible — no code changes needed.

Each service can be deployed as a separate **Azure App Service** or **Azure Container App**, with the gateway serving as the public entry point.
