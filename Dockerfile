# =============================================================
# Stage 1: Build the frontend
# =============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with API path relative (same origin in Docker)
ENV VITE_API_BASE_URL=/api
RUN npm run build

# =============================================================
# Stage 2: Production image
# =============================================================
FROM node:20-alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app/backend

# Install backend dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Copy frontend build output to expected path
# Backend resolves frontend at: path.join(__dirname, '../../frontend/dist')
# __dirname for app.js = /app/backend/src, so ../../frontend/dist = /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create upload directory
RUN mkdir -p /app/backend/upload /app/backend/uploads

# Expose port
EXPOSE 5200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5200/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
