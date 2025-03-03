# HiveFi Self-Hosting Guide

Learn how to deploy and maintain your own instance of HiveFi in a production environment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Maintenance](#maintenance)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 100GB+ SSD
- **OS**: Ubuntu 20.04 LTS or newer
- **Network**: Static IP, 100Mbps+

### Software Requirements

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- pnpm 8+
- n8n 1.0+
- PostgreSQL 14+
- Redis 6+

## Architecture Overview

### Component Stack

```
                   ┌─────────────┐
                   │   Nginx     │
                   │   Proxy     │
                   └─────┬───────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼──────┐               ┌───────▼────────┐
│  HiveFi API   │               │  HiveFi Web    │
│   Service     │               │     App        │
└────────┬──────┘               └───────┬────────┘
         │                              │
         │         ┌──────────┐         │
         ├────────►│   n8n    │◄───────┤
         │         │ Workflow │         │
         │         └────┬─────┘         │
┌────────▼──────┐      │         ┌─────▼─────────┐
│  PostgreSQL   │      │         │    Redis      │
│  Database     │      │         │    Cache      │
└───────────────┘      │         └───────────────┘
                       │
              ┌────────▼────────┐
              │  Agent Runner   │
              │   Service       │
              └─────────────────┘
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/hivefi/hivefi.git
cd hivefi
```

### 2. Install Dependencies

```bash
# Install project dependencies
pnpm install

# Install global tools
npm install -g n8n pm2
```

### 3. Setup Database

```bash
# Create PostgreSQL database
sudo -u postgres psql

CREATE DATABASE hivefi;
CREATE USER hivefi WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE hivefi TO hivefi;
\q
```

### 4. Install Redis

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set supervised systemd
# Set requirepass your-redis-password

# Restart Redis
sudo systemctl restart redis
```

## Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hivefi
POSTGRES_USER=hivefi
POSTGRES_PASSWORD=your-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# n8n
N8N_PROTOCOL=https
N8N_HOST=workflow.yourdomain.com
N8N_PORT=5678
N8N_ENCRYPTION_KEY=your-encryption-key

# API Keys
HIVEFI_API_KEY=your-api-key
BLOCKCHAIN_API_KEY=your-blockchain-api-key

# Security
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/hivefi

# API Service
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web App
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# n8n
server {
    listen 80;
    server_name workflow.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment

### Using Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    env_file: .env.production
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3001:3001"
    env_file: .env.production

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    env_file: .env.production
    volumes:
      - ~/.n8n:/home/node/.n8n

  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    env_file: .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Manual Deployment

```bash
# Build API
cd api
pnpm build
pm2 start dist/main.js --name hivefi-api

# Build Web App
cd ../web
pnpm build
pm2 start server.js --name hivefi-web

# Start n8n
n8n start --tunnel
```

## Monitoring

### Health Checks

```bash
# API Health Check
curl https://api.yourdomain.com/health

# n8n Health Check
curl https://workflow.yourdomain.com/healthz
```

### Logging

```bash
# View API logs
pm2 logs hivefi-api

# View Web App logs
pm2 logs hivefi-web

# View n8n logs
tail -f ~/.n8n/n8n.log
```

### Metrics

```bash
# Install Prometheus & Grafana
docker-compose -f monitoring/docker-compose.yml up -d

# Access Grafana
open http://localhost:3000
```

## Maintenance

### Backup

```bash
# Backup database
pg_dump -U hivefi hivefi > backup.sql

# Backup n8n data
cp -r ~/.n8n/data backup/n8n

# Backup Redis
redis-cli -a your-redis-password save
cp /var/lib/redis/dump.rdb backup/redis/
```

### Updates

```bash
# Update HiveFi
git pull
pnpm install
pnpm build

# Update n8n
npm update -g n8n

# Restart services
pm2 restart all
```

## Security

### SSL/TLS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d app.yourdomain.com
sudo certbot --nginx -d workflow.yourdomain.com
```

### Firewall

```bash
# Configure UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Security Headers

```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U hivefi -h localhost -d hivefi
```

2. **Redis Connection Issues**
```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping
```

3. **n8n Issues**
```bash
# Check n8n status
pm2 status

# Reset n8n
rm -rf ~/.n8n/database.sqlite
n8n start
```

### Debug Mode

```bash
# Enable API debug mode
DEBUG=* pm2 restart hivefi-api

# Enable n8n debug mode
n8n start --debug
```

### Support Resources

1. Check our [GitHub Issues](https://github.com/hivefi/hivefi/issues)
2. Join our [Discord](https://discord.gg/hivefiai) #self-hosting channel
3. Review the [API Documentation](../api-reference/index.md)
4. Contact our support team

## Next Steps

1. Set up monitoring and alerting
2. Configure automated backups
3. Implement CI/CD pipelines
4. Join our self-hosting community

Need more help? Check out our [Plugin Development Guide](plugin-guide.md) and [n8n Workflows Guide](n8n-workflows.md).
