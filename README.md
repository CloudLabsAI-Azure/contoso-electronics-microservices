# Contoso Electronics — Microservices

The same Contoso Electronics e-commerce application, decomposed into independently deployable services. Each service owns its data, has its own Dockerfile, and can be built, tested, and deployed on its own.

---

## Application Overview

This application is split into **three backend services** and a **React frontend**:

- **Product Service** — manages the product catalog (CRUD operations).
- **Order Service** — handles order placement and retrieval; calls the Product Service internally to validate items.
- **Gateway** — the single entry point for all client traffic; routes API requests to the appropriate backend service and serves the React frontend.
- **Client** — a React SPA that is compiled at build time and served as static files by the Gateway.

Each backend service connects to its **own separate database**. There is no shared database.

---

## Architecture

```
                    ┌──────────────┐
                    │    Client    │
                    │   (React)   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Gateway    │
                    │  (port 3000) │
                    └──┬───────┬───┘
                       │       │
              ┌────────▼──┐ ┌──▼─────────┐
              │  Product   │ │   Order    │
              │  Service   │ │  Service   │
              │ (port 3001)│ │(port 3002) │
              └─────┬──────┘ └──┬─────────┘
                    │           │
                    ▼           ▼
              ┌──────────┐ ┌──────────┐
              │ products │ │  orders  │
              │   DB     │ │   DB     │
              └──────────┘ └──────────┘
```

- The client **never** talks directly to Product Service or Order Service.
- All traffic flows through the **Gateway**.
- Order Service calls Product Service over HTTP to validate product data at order time.

---

## Key Components

| Component | Location | Port | What It Does |
|-----------|----------|------|--------------|
| Product Service | `product-service/` | 3001 | Product CRUD, connects to its own MongoDB database |
| Order Service | `order-service/` | 3002 | Order creation/retrieval, calls Product Service internally |
| Gateway | `gateway/` | 3000 | Routes `/api/products/*` and `/api/orders/*` to backend services, serves React static files |
| React Client | `client/` | — | Built once at image build time, served by Gateway |

---

## Dockerfiles — What Builds What

| Dockerfile | Location | What It Produces |
|------------|----------|-----------------|
| `product-service/Dockerfile` | Inside `product-service/` | Standalone image for the product API |
| `order-service/Dockerfile` | Inside `order-service/` | Standalone image for the order API |
| `Dockerfile.gateway` | Repo root | **Multi-stage** — builds the React client first, then packages the Gateway with the compiled frontend |

> **Note:** The Gateway Dockerfile lives at the **repo root** (not inside `gateway/`) because it needs access to both the `client/` and `gateway/` directories during the build. Pay attention to the Docker **build context** when constructing your build commands.

---

## Environment Variables

Each service expects different configuration at runtime:

| Variable | Used By | Purpose |
|----------|---------|---------|
| `PORT` | All services | The port the service listens on |
| `MONGO_URI` | Product Service, Order Service | MongoDB (or Cosmos DB) connection string — **each service uses a different database** |
| `PRODUCT_SERVICE_URL` | Order Service, Gateway | Internal URL to reach the Product Service |
| `ORDER_SERVICE_URL` | Gateway | Internal URL to reach the Order Service |

- Product Service needs: `PORT`, `MONGO_URI`
- Order Service needs: `PORT`, `MONGO_URI`, `PRODUCT_SERVICE_URL`
- Gateway needs: `PORT`, `PRODUCT_SERVICE_URL`, `ORDER_SERVICE_URL`

---

## Inter-Service Communication

Services discover each other through **environment variables**, not hard-coded URLs. In a container orchestrator, these URLs map to internal DNS names or service endpoints. The Gateway fans out incoming API calls to the correct upstream service.

---

## Database Design

| Service | Database Name | Collections |
|---------|--------------|-------------|
| Product Service | `contoso_products` | products |
| Order Service | `contoso_orders` | orders |

Orders store a **snapshot** of product name and price at the time of purchase (denormalized). This avoids cross-service database joins.

Both databases are compatible with **Azure Cosmos DB (MongoDB API)** — no code changes required.

---

## Health Endpoints

| Endpoint | Service | Notes |
|----------|---------|-------|
| `GET :3001/health` | Product Service | Direct health check |
| `GET :3002/health` | Order Service | Direct health check |
| `GET :3000/health` | Gateway | Aggregated — checks itself + both downstream services |

These are useful for container health checks, readiness/liveness probes, and deployment validation.

---

## API Endpoints (via Gateway on port 3000)

| Method | Path | Routed To |
|--------|------|-----------|
| `GET` | `/api/products` | Product Service |
| `POST` | `/api/products` | Product Service |
| `DELETE` | `/api/products/:id` | Product Service |
| `POST` | `/api/orders` | Order Service |
| `GET` | `/api/orders/:id` | Order Service |

---

## Project Structure

```
Microservices/
├── client/                  # React SPA source
│   ├── src/
│   └── package.json
├── product-service/         # Product API
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── order-service/           # Order API
│   ├── src/
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── gateway/                 # API Gateway + serves frontend
│   ├── src/
│   └── package.json
├── Dockerfile.gateway       # Multi-stage build (client + gateway)
├── docker-compose.yml       # Local dev — runs everything + MongoDB
└── k8s/                     # Kubernetes manifests for AKS deployment
    ├── namespace.yaml
    ├── product-service.yaml
    ├── order-service.yaml
    ├── gateway.yaml
    └── ingress.yaml
```

---

## Hints

- There are **three separate images** to build — not one. Each has its own Dockerfile.
- The Gateway Dockerfile has a different build context than the other two. Look at where it lives.
- Services talk to each other via **URLs passed as environment variables** — in Kubernetes, these become internal service DNS names.
- Each service needs its **own database connection string** — they don't share a database.
- The `k8s/` folder contains Kubernetes manifests if you're deploying to AKS. Study how they reference images, secrets, and service discovery.
- The `docker-compose.yml` shows how all the pieces fit together locally — it's a useful reference for understanding the relationships between services.
- For Azure deployments, swap `MONGO_URI` values with Cosmos DB connection strings. Nothing else changes.
