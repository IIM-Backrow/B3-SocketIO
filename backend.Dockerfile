# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY backend/package*.json ./backend/
COPY backend/tsconfig.json ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Development stage
FROM base AS dev-deps
RUN npm ci

# Build stage
FROM dev-deps AS build

# Copy source code
COPY backend/src ./src
COPY backend/lib ./lib
COPY shared ../shared

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/backend/dist ./dist

# Copy shared types (needed at runtime)
COPY shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/api/status', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD ["npm", "start"]