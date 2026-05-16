# SpecToPR Deployment Guide

Complete guide for deploying SpecToPR to production environments.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Security Hardening](#security-hardening)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [AWS Deployment](#aws-deployment)
  - [Azure Deployment](#azure-deployment)
  - [Google Cloud Platform](#google-cloud-platform)
  - [Heroku Deployment](#heroku-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Performance Optimization](#performance-optimization)
- [Scaling Considerations](#scaling-considerations)
- [Cost Estimation](#cost-estimation)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets requirements (>80%)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Code linting passes (`npm run lint`)
- [ ] Documentation is up to date

### Configuration
- [ ] Environment variables configured for production
- [ ] API keys and secrets secured
- [ ] Database connection strings set
- [ ] CORS origins configured correctly
- [ ] Rate limiting configured
- [ ] Logging configured

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] Authentication/authorization working
- [ ] Secrets not in version control
- [ ] Dependencies updated

### Performance
- [ ] Frontend build optimized (`npm run build`)
- [ ] Images and assets optimized
- [ ] Caching strategy implemented
- [ ] Database indexes created
- [ ] API response times acceptable

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Logging infrastructure ready
- [ ] Alerts configured
- [ ] Health check endpoints working

## Environment Setup

### Production Environment Variables

**Backend (`backend/.env.production`):**
```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3001
HOST=0.0.0.0

# Bob API Configuration
BOB_API_URL=https://api.bob.com
BOB_API_KEY=your_production_bob_api_key

# GitHub Configuration
GITHUB_TOKEN=your_production_github_token

# Security
JWT_SECRET=your_secure_random_secret_key_min_32_chars
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/spectropr/app.log

# Monitoring
SENTRY_DSN=your_sentry_dsn_if_using
```

**Frontend (`frontend/.env.production`):**
```env
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com

# Application Settings
REACT_APP_NAME=SpecToPR
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Generating Secure Secrets

```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret (OpenSSL)
openssl rand -hex 32

# Generate JWT secret (Python)
python -c "import secrets; print(secrets.token_hex(32))"
```

## Security Hardening

### 1. HTTPS Configuration

**Using Let's Encrypt (Certbot):**
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 2. Security Headers

Add to backend `server.js`:
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### 4. Input Sanitization

```javascript
const validator = require('validator');
const xss = require('xss');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return xss(validator.escape(input));
};

app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      req.body[key] = sanitizeInput(req.body[key]);
    });
  }
  next();
});
```

### 5. Environment Variable Validation

```javascript
// backend/config/validateEnv.js
const requiredEnvVars = [
  'BOB_API_URL',
  'BOB_API_KEY',
  'GITHUB_TOKEN',
  'JWT_SECRET',
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Validate JWT secret length
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters');
  process.exit(1);
}
```

## Deployment Options

### Docker Deployment

#### 1. Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

**Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - BOB_API_URL=${BOB_API_URL}
      - BOB_API_KEY=${BOB_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

#### 3. Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d --build
```

### AWS Deployment

#### Option 1: AWS Elastic Beanstalk

**1. Install EB CLI:**
```bash
pip install awsebcli
```

**2. Initialize EB:**
```bash
cd backend
eb init -p node.js-18 spectropr-backend --region us-east-1
```

**3. Create environment:**
```bash
eb create spectropr-prod --instance-type t3.small
```

**4. Configure environment variables:**
```bash
eb setenv BOB_API_URL=https://api.bob.com \
  BOB_API_KEY=your_key \
  GITHUB_TOKEN=your_token \
  JWT_SECRET=your_secret \
  NODE_ENV=production
```

**5. Deploy:**
```bash
eb deploy
```

#### Option 2: AWS ECS (Fargate)

**1. Create ECR repositories:**
```bash
aws ecr create-repository --repository-name spectropr-backend
aws ecr create-repository --repository-name spectropr-frontend
```

**2. Build and push images:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t spectropr-backend .
docker tag spectropr-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spectropr-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spectropr-backend:latest

# Build and push frontend
cd ../frontend
docker build -t spectropr-frontend .
docker tag spectropr-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spectropr-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/spectropr-frontend:latest
```

**3. Create ECS task definition and service** (use AWS Console or CloudFormation)

#### Option 3: AWS Lambda + API Gateway

For serverless deployment, refactor backend into Lambda functions.

### Azure Deployment

#### Azure App Service

**1. Install Azure CLI:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**2. Login:**
```bash
az login
```

**3. Create resource group:**
```bash
az group create --name spectropr-rg --location eastus
```

**4. Create App Service plan:**
```bash
az appservice plan create --name spectropr-plan --resource-group spectropr-rg --sku B1 --is-linux
```

**5. Create web apps:**
```bash
# Backend
az webapp create --resource-group spectropr-rg --plan spectropr-plan --name spectropr-backend --runtime "NODE|18-lts"

# Frontend
az webapp create --resource-group spectropr-rg --plan spectropr-plan --name spectropr-frontend --runtime "NODE|18-lts"
```

**6. Configure environment variables:**
```bash
az webapp config appsettings set --resource-group spectropr-rg --name spectropr-backend --settings \
  BOB_API_URL=https://api.bob.com \
  BOB_API_KEY=your_key \
  GITHUB_TOKEN=your_token \
  JWT_SECRET=your_secret \
  NODE_ENV=production
```

**7. Deploy:**
```bash
# Backend
cd backend
zip -r deploy.zip .
az webapp deployment source config-zip --resource-group spectropr-rg --name spectropr-backend --src deploy.zip

# Frontend
cd ../frontend
npm run build
cd build
zip -r ../deploy.zip .
cd ..
az webapp deployment source config-zip --resource-group spectropr-rg --name spectropr-frontend --src deploy.zip
```

### Google Cloud Platform

#### Google App Engine

**1. Install gcloud CLI:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**2. Create app.yaml files:**

**Backend app.yaml:**
```yaml
runtime: nodejs18
env: standard
instance_class: F2

env_variables:
  NODE_ENV: "production"
  BOB_API_URL: "https://api.bob.com"
  BOB_API_KEY: "your_key"
  GITHUB_TOKEN: "your_token"
  JWT_SECRET: "your_secret"

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.65
```

**Frontend app.yaml:**
```yaml
runtime: nodejs18
env: standard

handlers:
  - url: /static
    static_dir: build/static
    secure: always

  - url: /.*
    static_files: build/index.html
    upload: build/index.html
    secure: always
```

**3. Deploy:**
```bash
# Backend
cd backend
gcloud app deploy

# Frontend
cd ../frontend
npm run build
gcloud app deploy
```

### Heroku Deployment

**1. Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**2. Login:**
```bash
heroku login
```

**3. Create apps:**
```bash
heroku create spectropr-backend
heroku create spectropr-frontend
```

**4. Configure environment variables:**
```bash
heroku config:set -a spectropr-backend \
  BOB_API_URL=https://api.bob.com \
  BOB_API_KEY=your_key \
  GITHUB_TOKEN=your_token \
  JWT_SECRET=your_secret \
  NODE_ENV=production
```

**5. Deploy:**
```bash
# Backend
cd backend
git init
heroku git:remote -a spectropr-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Frontend
cd ../frontend
git init
heroku git:remote -a spectropr-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm ci
      
      - name: Run frontend tests
        run: cd frontend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: spectropr-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/build s3://spectropr-frontend --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: us-east-1
```

## Monitoring and Logging

### 1. Application Monitoring

**Using PM2 (Node.js process manager):**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/server.js --name spectropr-backend

# Monitor
pm2 monit

# View logs
pm2 logs spectropr-backend

# Setup startup script
pm2 startup
pm2 save
```

**PM2 ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'spectropr-backend',
    script: './server.js',
    cwd: './backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M'
  }]
};
```

### 2. Error Tracking with Sentry

```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// backend/server.js
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes here

app.use(Sentry.Handlers.errorHandler());
```

### 3. Logging with Winston

```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

### 4. Health Check Endpoint

```javascript
// backend/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {
      bob: 'unknown',
      github: 'unknown',
    }
  };

  try {
    // Check Bob API
    await axios.get(process.env.BOB_API_URL + '/health');
    health.checks.bob = 'ok';
  } catch (error) {
    health.checks.bob = 'error';
    health.status = 'degraded';
  }

  try {
    // Check GitHub API
    await axios.get('https://api.github.com');
    health.checks.github = 'ok';
  } catch (error) {
    health.checks.github = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Backup and Recovery

### 1. Database Backups

If using a database, set up automated backups:

```bash
# MongoDB backup script
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mongodump --out "$BACKUP_DIR/$TIMESTAMP"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

### 2. Configuration Backups

```bash
# Backup environment variables
#!/bin/bash
BACKUP_DIR="/backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Export environment variables (without values)
env | grep -E '^(BOB|GITHUB|JWT)' | cut -d= -f1 > "$BACKUP_DIR/env_vars_$TIMESTAMP.txt"
```

### 3. Disaster Recovery Plan

1. **Regular backups**: Daily automated backups
2. **Off-site storage**: Store backups in different region
3. **Recovery testing**: Test recovery process monthly
4. **Documentation**: Keep recovery procedures updated
5. **Monitoring**: Alert on backup failures

## Performance Optimization

### 1. Backend Optimization

**Caching:**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.get('/api/data', async (req, res) => {
  const cacheKey = 'data_' + req.params.id;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const data = await fetchData(req.params.id);
  cache.set(cacheKey, data);
  res.json(data);
});
```

**Compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Frontend Optimization

**Code splitting:**
```javascript
// Use React.lazy for route-based code splitting
const ResultsTabs = React.lazy(() => import('./components/ResultsTabs'));

<Suspense fallback={<LoadingSpinner />}>
  <ResultsTabs />
</Suspense>
```

**Asset optimization:**
```bash
# Optimize images
npm install -g imagemin-cli
imagemin src/images/* --out-dir=build/images
```

### 3. CDN Configuration

Use CloudFront, Cloudflare, or similar for static assets.

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration (Nginx):**
```nginx
upstream backend {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    listen 80;
    
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Vertical Scaling

Increase instance size based on metrics:
- CPU usage > 70% sustained
- Memory usage > 80%
- Response time > 1s

### Auto-scaling

**AWS Auto Scaling:**
```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name spectropr-asg \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:... \
  --health-check-type ELB \
  --health-check-grace-period 300
```

## Cost Estimation

### Monthly Cost Breakdown (AWS Example)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| EC2 (Backend) | t3.small x 2 | $30 |
| EC2 (Frontend) | t3.micro x 1 | $7 |
| Load Balancer | Application LB | $20 |
| S3 (Storage) | 10 GB | $0.23 |
| CloudFront (CDN) | 100 GB transfer | $8.50 |
| Route 53 (DNS) | 1 hosted zone | $0.50 |
| CloudWatch (Monitoring) | Basic | $10 |
| **Total** | | **~$76/month** |

### Cost Optimization Tips

1. **Use reserved instances** for predictable workloads (save 30-50%)
2. **Enable auto-scaling** to scale down during low traffic
3. **Use spot instances** for non-critical workloads (save up to 90%)
4. **Optimize images and assets** to reduce bandwidth costs
5. **Implement caching** to reduce API calls
6. **Monitor and eliminate unused resources**

---

## Post-Deployment

### 1. Smoke Testing

```bash
# Test health endpoint
curl https://api.yourdomain.com/api/health

# Test PR generation
curl -X POST https://api.yourdomain.com/api/generate-pr \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"...","specification":"...","githubToken":"..."}'
```

### 2. Monitoring Setup

- Set up alerts for errors
- Monitor response times
- Track API usage
- Monitor resource utilization

### 3. Documentation

- Update deployment documentation
- Document rollback procedures
- Create runbooks for common issues
- Update team on deployment

---

**Deployment complete! 🚀**

For issues or questions, refer to [SETUP.md](SETUP.md) or [DEVELOPMENT.md](DEVELOPMENT.md).