# Docker Setup for SocketIO Application

This guide explains how to run the full SocketIO application (backend + frontend) using Docker.

> **🔙 Back to:** [📚 Documentation Index](./README.md) | [🏠 Project Home](../README.md)

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)

> **📁 Note:** All Docker commands should be run from the **project root directory** (not from the docs folder where this file is located).

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start both services:**

   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**

   ```bash
   docker-compose up -d --build
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Using Docker directly

#### Backend

1. **Build the backend image:**

   ```bash
   docker build -f backend.Dockerfile -t socketio-backend .
   ```

2. **Run the backend container:**
   ```bash
   docker run -p 3000:3000 \
     -e NODE_ENV=production \
     -e CORS_ORIGIN=http://localhost:5173 \
     socketio-backend
   ```

#### Frontend

1. **Build the frontend image:**

   ```bash
   docker build -f frontend.Dockerfile -t socketio-frontend .
   ```

2. **Run the frontend container:**
   ```bash
   docker run -p 5173:80 socketio-frontend
   ```

## Services

### Backend Service

- **Port:** 3000
- **Technology:** Node.js with Express and Socket.IO
- **Dockerfile:** `backend.Dockerfile`

### Frontend Service

- **Port:** 5173 (mapped to container port 80)
- **Technology:** Static HTML/CSS/JS served by nginx
- **Dockerfile:** `frontend.Dockerfile`

## Environment Variables

The following environment variables can be configured for the backend:

- `NODE_ENV`: Application environment (default: `development`)
- `PORT`: Server port (default: `3000`)
- `CORS_ORIGIN`: CORS origin for frontend (default: `http://localhost:5173`)
- `LOG_LEVEL`: Logging level (default: `info`)

## Health Checks

Both services include health checks:

- **Backend:** Checks the `/api/status` endpoint
- **Frontend:** Checks the nginx `/health` endpoint

## Development vs Production

Both Dockerfiles are optimized for production:

- **Backend:** Multi-stage build with only production dependencies
- **Frontend:** Static files served by nginx with optimized configuration
- **Security:** Non-root users and security headers

## Accessing the Application

Once running, the application will be available at:

### Frontend

- **Main application:** `http://localhost:5173`
- **Health check:** `http://localhost:5173/health`

### Backend

- **API:** `http://localhost:3000/api/`
- **Status endpoint:** `http://localhost:3000/api/status`
- **Socket.IO:** `ws://localhost:3000`

## Logs

To view logs from the containers:

```bash
# Using docker-compose
docker-compose logs -f backend
docker-compose logs -f frontend

# View all logs
docker-compose logs -f

# Using docker directly
docker logs -f socketio-backend
docker logs -f socketio-frontend
```

## Troubleshooting

1. **Port already in use:**
   - Backend: Make sure port 3000 is not already in use
   - Frontend: Make sure port 5173 is not already in use
2. **Build failures:** Ensure you're running the commands from the project root directory
3. **CORS issues:** Update the `CORS_ORIGIN` environment variable to match your frontend URL
4. **Frontend can't connect to backend:** Ensure both services are running and the backend is accessible
5. **Service dependencies:** The frontend service depends on the backend, so the backend will start first

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │
│   (nginx:80)    │◄──►│  (node:3000)    │
│  Port: 5173     │    │  Port: 3000     │
└─────────────────┘    └─────────────────┘
        │                       │
        │                       │
    Static Files          API + Socket.IO
    HTML/CSS/JS            Express Server
```

---

## 🔗 Related Documentation

- **[📚 Documentation Index](./README.md)** - Browse all project documentation
- **[⚡ Backend Guide](./backend/README.md)** - Backend development and architecture
- **[🎨 Frontend Guide](./frontend/README.md)** - Frontend setup and features
- **[🏠 Project Home](../README.md)** - Return to project overview
