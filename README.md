# Contoso Electronics - Microservices Edition

This is the microservices version of the Contoso Electronics demo application.

The original monolith has been decomposed into independently deployable services. Each service owns its own data and can be built and deployed separately.

The goal of this version is to demonstrate service isolation, inter-service communication, and independent scaling — not to build a production-ready commerce engine.

---

## Architecture Overview

At a high level:

- The **Gateway** is the entry point.
- The **Product Service** manages catalog data.
- The **Order Service** creates and retrieves orders.
- Each service has its own MongoDB database.
- The frontend is built once and served by the Gateway.

```
Client (React)
      │
      ▼
Gateway (:3000)
      │
      ├──▶ Product Service (:3001)
      │
      └──▶ Order Service (:3002)
```

The client never talks directly to backend services.  
All traffic goes through the Gateway.

---

## Services

| Service | Port | Responsibility |
|----------|------|----------------|
| `gateway` | 3000 | API routing, serves static React build, aggregates health checks |
| `product-service` | 3001 | Product CRUD operations and batch lookup |
| `order-service` | 3002 | Order creation and retrieval |
| `client` | — | React SPA, built and served by the gateway |

---

## Design Notes

A few deliberate architectural choices:

- **Database per service**  
  Each service owns its own MongoDB database:
  - `contoso_products`
  - `contoso_orders`

- **Denormalized order data**  
  Orders store product name and price at time of purchase to avoid cross-service joins.

- **Synchronous communication**  
  The order service calls the product service over HTTP to validate pricing.

- **Gateway pattern**  
  The gateway acts as the single entry point for client traffic.

This setup keeps responsibilities clean and makes services independently deployable.

---

## Project Structure

```
Microservices/
├── client/
├── product-service/
├── order-service/
├── gateway/
├── docker-compose.yml
├── Dockerfile.gateway
└── README.md
```

Each service has:

- Its own `package.json`
- Its own Dockerfile
- Its own test suite (where applicable)

---

## Running with Docker (Recommended)

This is the easiest way to run everything locally.

```bash
docker-compose up --build
```

Once started, open:

```
http://localhost:3000
```

The gateway will route requests to downstream services.

---

## Running Without Docker (Local Dev)

Prerequisites:

- Node.js 20+
- MongoDB running on `localhost:27017`

Install dependencies for each service:

```bash
cd product-service && npm install && cd ..
cd order-service && npm install && cd ..
cd gateway && npm install && cd ..
cd client && npm install && cd ..
```

Build the frontend:

```bash
cd client
npm run build
cd ..
```

Copy the build output to the gateway:

```bash
cp -r client/build gateway/public
```

Start services in separate terminals:

```bash
# Product Service
cd product-service
MONGO_URI=mongodb://localhost:27017/contoso_products npm start
```

```bash
# Order Service
cd order-service
MONGO_URI=mongodb://localhost:27017/contoso_orders \
PRODUCT_SERVICE_URL=http://localhost:3001 npm start
```

```bash
# Gateway
cd gateway
PRODUCT_SERVICE_URL=http://localhost:3001 \
ORDER_SERVICE_URL=http://localhost:3002 npm start
```

---

## API Endpoints

All client requests go through the gateway on port 3000.

### Product Routes

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `DELETE /api/products/:id`

### Order Routes

- `POST /api/orders`
- `GET /api/orders/:id`

---

## Health Endpoints

- `GET /health` (via gateway) — aggregated status
- `GET :3001/health` — product service
- `GET :3002/health` — order service

Useful for container health checks and deployment validation.

---

## Tests

Run tests per service:

```bash
cd product-service && npm test
```

```bash
cd order-service && npm test
```

The order service mocks calls to the product service during testing.

---

## Environment Variables

Common variables:

| Variable | Used By | Purpose |
|----------|----------|----------|
| `PORT` | All services | Service port |
| `MONGO_URI` | product/order | MongoDB connection string |
| `PRODUCT_SERVICE_URL` | order/gateway | Base URL for product service |
| `ORDER_SERVICE_URL` | gateway | Base URL for order service |

---

## Azure Deployment Notes

When deploying to Azure:

- Replace `MONGO_URI` with your Cosmos DB (MongoDB API) connection string.
- Each service can be deployed independently.
- The gateway should be exposed as the public entry point.
- Health endpoints can be used for readiness/liveness probes.

No code changes are required for Cosmos DB (MongoDB API compatibility).

---

## Purpose of This Repository

This project is meant to:

- Demonstrate microservices architecture concepts
- Support CI/CD pipeline experiments
- Validate container-based deployments
- Showcase independent service lifecycle management

It is intentionally simple to keep the focus on DevOps and delivery workflows.
