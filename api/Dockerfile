# API Dockerfile
FROM node:20-alpine AS base

# Install dependencies for prisma
RUN apk add --no-cache openssl libssl1.1

# Set working directory
WORKDIR /app

# Copy package files
COPY api/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy prisma schema
COPY api/prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY api/src ./src/
COPY api/dist ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
