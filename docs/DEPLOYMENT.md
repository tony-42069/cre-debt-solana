# Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CRE-Debt-Solana platform to production. The platform consists of:

- **Frontend**: Next.js 15 application
- **API**: Express.js backend with PostgreSQL
- **Smart Contracts**: Solana programs (loan-core, property-registry, borrower-registry)
- **Database**: PostgreSQL 15
- **Caching**: Redis 7

## Prerequisites

### System Requirements

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+
- Solana CLI tools (for smart contract deployment)
- At least 4GB RAM available
- At least 50GB disk space

### Required Accounts

1. **Solana RPC Provider**: Helius, Alchemy, or QuickNode
2. **Container Registry**: Docker Hub or private registry
3. **Domain Name**: For SSL certificates
4. **SSL Certificates**: From Let's Encrypt or commercial CA

## Deployment Methods

### Method 1: Docker Compose (Recommended for中小规模)

```bash
# Clone the repository
git clone https://github.com/tony-42069/cre-debt-solana.git
cd cre-debt-solana

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start the stack
docker compose up -d

# Check logs
docker compose logs -f
```

### Method 2: Kubernetes (Recommended for大规模)

Helm charts are available in the `/k8s` directory:

```bash
# Add Helm repository
helm repo add cre-debt https://charts.cre-debt.com

# Install with custom values
helm install cre-debt cre-debt/cre-debt -f values-production.yaml
```

### Method 3: Manual Deployment

#### 1. Build and Push Images

```bash
# Build API image
cd api
docker build -t cre-debt/api:latest .
docker tag cre-debt/api:latest registry.example.com/cre-debt/api:latest
docker push registry.example.com/cre-debt/api:latest

# Build Frontend image
cd ../app
docker build -t cre-debt/frontend:latest .
docker tag cre-debt/frontend:latest registry.example.com/cre-debt/frontend:latest
docker push registry.example.com/cre-debt/frontend:latest
```

#### 2. Deploy Database

```bash
# Start PostgreSQL
docker run -d \
  --name postgres \
  -e POSTGRES_USER=credebt \
  -e POSTGRES_PASSWORD=secure-password \
  -e POSTGRES_DB=cre_debt \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 3. Deploy API

```bash
docker run -d \
  --name cre-debt-api \
  -e DATABASE_URL=postgresql://credebt:secure-password@postgres:5432/cre_debt \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-jwt-secret \
  -e NODE_ENV=production \
  -p 4000:4000 \
  --link postgres \
  --link redis \
  registry.example.com/cre-debt/api:latest
```

## Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your-256-bit-secret-key
BCRYPT_ROUNDS=12

# Solana
SOLANA_CLUSTER=mainnet-beta
SOLANA_RPC_URL=https://your-rpc-provider.com

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### SSL/TLS Configuration

For production, always use HTTPS. Configure using a reverse proxy (Nginx/Caddy):

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Smart Contract Deployment

### 1. Configure Anchor

```toml
# Anchor.toml
[programs.localnet]
loan_core = "H4Rdq9n8KJ9P8n7Fg6PaFpoGXkYsidMpWTK6W2BeZ7FE"
property_registry = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
borrower_registry = "8g6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnU"

[programs.mainnet]
loan_core = "YOUR_MAINNET_PROGRAM_ID"
property_registry = "YOUR_MAINNET_PROGRAM_ID"
borrower_registry = "YOUR_MAINNET_PROGRAM_ID"
```

### 2. Build and Deploy

```bash
# Build programs
anchor build

# Deploy to devnet first
anchor deploy --provider.cluster devnet

# Test thoroughly
anchor test --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

### 3. Verify Deployment

```bash
# Check program accounts
solana account YOUR_PROGRAM_ID

# Verify IDL
anchor idl fetch --programId YOUR_PROGRAM_ID
```

## Database Setup

### 1. Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate deploy
```

### 2. Seed Initial Data

```bash
npm run db:seed
```

### 3. Verify Schema

```bash
npm run db:studio
```

## Monitoring Setup

### Application Logs

```bash
# View logs
docker compose logs -f api

# Export logs
docker compose logs api > logs/api-$(date +%Y%m%d).log
```

### Metrics Endpoint

The API exposes metrics at `/metrics` in Prometheus format:

```bash
curl http://localhost:4000/metrics
```

### Health Checks

```bash
# API health
curl http://localhost:4000/health

# Database health
curl http://localhost:4000/health/db
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS for all services
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up DDoS protection (Cloudflare/AWS Shield)
- [ ] Configure backup and disaster recovery
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Rotate secrets regularly
- [ ] Use environment variables for sensitive data

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump -U credebt cre_debt > backup-$(date +%Y%m%d).sql

# Restore backup
psql -U credebt cre_debt < backup.sql
```

### Automated Backups

Configure cron job for daily backups:

```bash
# /etc/cron.daily/backup-credebt
#!/bin/bash
pg_dump -U credebt cre_debt | gzip > /backups/cre-debt-$(date +%Y%m%d).sql.gz
```

## Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker compose up -d --scale api=3

# Scale with load balancer
nginx -s reload
```

### Database Scaling

For high-traffic deployments:

1. Use PostgreSQL read replicas
2. Implement connection pooling (PgBouncer)
3. Consider using Aurora or Cloud SQL

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if services are running: `docker ps`
   - Verify network connectivity: `docker network inspect cre-debt-network`

2. **Database Connection Failed**
   - Check credentials in .env
   - Verify database is healthy: `docker exec cre-debt-postgres pg_isready`

3. **Smart Contract Deployment Failed**
   - Verify SOL balance: `solana balance`
   - Check cluster configuration: `solana config get`

### Logs

```bash
# API logs
docker logs cre-debt-api

# Frontend logs
docker logs cre-debt-frontend

# Database logs
docker logs cre-debt-postgres
```

## Rollback Procedure

### Rollback API

```bash
# List previous images
docker images cre-debt/api

# Rollback to previous version
docker run -d \
  --name cre-debt-api-rollback \
  registry.example.com/cre-debt/api:previous-tag

# Update service
docker compose up -d api
```

### Rollback Database

```bash
# Stop application
docker compose stop api frontend

# Restore from backup
psql -U credebt cre_debt < backup.sql

# Restart application
docker compose start api frontend
```

## Support

For deployment issues:

1. Check the logs
2. Review the troubleshooting section
3. Contact the development team
4. Submit an issue on GitHub
