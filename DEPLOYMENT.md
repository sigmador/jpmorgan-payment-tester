# Deployment Guide

This guide covers deploying the JPMorgan Payments API Tester to various platforms.

## Table of Contents

- [Render Deployment](#render-deployment)
- [Heroku Deployment](#heroku-deployment)
- [Vercel Deployment](#vercel-deployment)
- [AWS EC2 Deployment](#aws-ec2-deployment)
- [Docker Deployment](#docker-deployment)

---

## Render Deployment

Render is the easiest option with the included `render.yaml` configuration.

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin master
   ```

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
   - `NODE_ENV` = `production` (auto-set)
   - `PORT` = `3001` (auto-set)
   - `JPMC_CLIENT_ID` = `your_client_id`
   - `JPMC_CLIENT_SECRET` = `your_client_secret`
   - `JPMC_API_KEY` = `your_api_key`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete
   - Your app will be live at `https://your-app-name.onrender.com`

### Method 2: Manual Configuration

1. **Create Web Service**
   - Choose "Web Service"
   - Connect repository

2. **Build Configuration**
   - **Build Command:** `npm install && npm run install:client && npm run build:client`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Add Environment Variables** (same as above)

---

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new app**
   ```bash
   heroku create jpmorgan-payment-tester
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JPMC_CLIENT_ID=your_client_id
   heroku config:set JPMC_CLIENT_SECRET=your_client_secret
   heroku config:set JPMC_API_KEY=your_api_key
   ```

4. **Add build scripts to package.json** (already included)
   ```json
   {
     "scripts": {
       "heroku-postbuild": "npm run install:client && npm run build:client"
     }
   }
   ```

5. **Deploy**
   ```bash
   git push heroku master
   ```

6. **Open your app**
   ```bash
   heroku open
   ```

### View Logs
```bash
heroku logs --tail
```

---

## Vercel Deployment

Vercel is optimized for frontend apps, so we'll need a slightly different approach.

### Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "client/build"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server.js"
       },
       {
         "src": "/(.*)",
         "dest": "client/build/$1"
       }
     ]
   }
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Add Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all required variables

---

## AWS EC2 Deployment

### Prerequisites
- AWS account
- EC2 instance running Ubuntu/Amazon Linux
- SSH access to the instance

### Steps

1. **Connect to your EC2 instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone your repository**
   ```bash
   git clone <your-repo-url>
   cd jpmorgan-payment-tester
   ```

5. **Install dependencies**
   ```bash
   npm install
   npm run install:client
   npm run build:client
   ```

6. **Create .env file**
   ```bash
   nano .env
   # Add your environment variables
   ```

7. **Start with PM2**
   ```bash
   pm2 start server.js --name jpmorgan-api-tester
   pm2 save
   pm2 startup
   ```

8. **Configure Nginx (Optional)**
   ```bash
   sudo apt-get install nginx
   ```
   
   Create Nginx config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Docker Deployment

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source files
COPY . .

# Build client
RUN npm run build:client

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built app from build stage
COPY --from=build /app/client/build ./client/build
COPY --from=build /app/server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  api-tester:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - JPMC_CLIENT_ID=${JPMC_CLIENT_ID}
      - JPMC_CLIENT_SECRET=${JPMC_CLIENT_SECRET}
      - JPMC_API_KEY=${JPMC_API_KEY}
    restart: unless-stopped
```

### Build and Run

```bash
# Build the image
docker build -t jpmorgan-api-tester .

# Run the container
docker run -p 3001:3001 \
  -e JPMC_CLIENT_ID=your_client_id \
  -e JPMC_CLIENT_SECRET=your_client_secret \
  -e JPMC_API_KEY=your_api_key \
  jpmorgan-api-tester
```

Or with Docker Compose:

```bash
# Create .env file with your credentials
docker-compose up -d
```

---

## Environment Variables Reference

All platforms need these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Default: 3001 |
| `JPMC_CLIENT_ID` | Yes | Your JPMorgan Client ID |
| `JPMC_CLIENT_SECRET` | Yes | Your JPMorgan Client Secret |
| `JPMC_API_KEY` | Yes | Your JPMorgan API Key |

---

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] API endpoints are accessible
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is configured (for production)
- [ ] Logs are accessible for debugging
- [ ] Health check endpoint works (`/api/health`)
- [ ] Test a sample API request
- [ ] Set up monitoring/alerts (optional)

---

## Troubleshooting

### Build Fails

**Issue:** Build fails during deployment

**Solutions:**
1. Check Node.js version (requires v16+)
2. Verify all dependencies are in package.json
3. Check build logs for specific errors
4. Ensure build command is correct

### App Crashes on Start

**Issue:** Application starts but immediately crashes

**Solutions:**
1. Check environment variables are set
2. Review application logs
3. Verify PORT is not already in use
4. Check server.js for errors

### Cannot Access Application

**Issue:** Deployment succeeds but can't access the app

**Solutions:**
1. Verify the correct URL is being used
2. Check firewall settings
3. Ensure the PORT is exposed correctly
4. Review platform-specific networking docs

---

## Monitoring and Logs

### Render
```bash
# View logs in dashboard or CLI
render logs -s your-service-name
```

### Heroku
```bash
heroku logs --tail
```

### PM2 (EC2)
```bash
pm2 logs jpmorgan-api-tester
pm2 monit
```

### Docker
```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow logs
```

---

## Security Best Practices

1. **Never commit credentials**
   - Always use environment variables
   - Keep .env in .gitignore

2. **Use HTTPS in production**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

3. **Implement rate limiting**
   - Prevent API abuse
   - Use libraries like express-rate-limit

4. **Rotate API keys regularly**
   - Update credentials periodically
   - Use secrets management services

5. **Monitor application logs**
   - Set up log aggregation
   - Create alerts for errors

---

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test locally first
4. Open an issue on GitHub

---

**Remember:** Always test deployments in a staging environment before production!
