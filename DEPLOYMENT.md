# Production Deployment & Auto-Start Setup

## Prerequisites

The setup instructions below will guide you through installing and configuring:
- MySQL server (database)
- Nginx (reverse proxy)
- Node.js and npm (should already be installed)
- Systemd (built-in on Ubuntu/Debian for service management)

## Architecture

The production setup uses a reverse proxy architecture for security and flexibility:

```
Internet → Nginx (ports 80/443, runs as root) → Node.js (ports 8080/8443, runs as regular user)
```

This allows the Node.js application to run as a non-privileged user while still serving on standard HTTP/HTTPS ports.

## Setup Instructions

### 1. Install and Configure MySQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Verify installation
mysql --version

# Secure MySQL installation (optional but recommended)
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql

# Enable MySQL to start on boot
sudo systemctl enable mysql

# Verify MySQL is running
sudo systemctl status mysql
```

Create database and user for the application:

```bash
# Login to MySQL as root
sudo mysql -u root -p

# Create database and user (replace with your credentials)
CREATE DATABASE your_database_name;
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Create your `.env.production` file with the database credentials:
```bash
# .env.production (on production server only)
NODE_ENV=production
HTTP_PORT=8080
HTTPS_PORT=8443
DATABASE_URL=mysql://your_username:your_password@localhost:3306/your_database_name
# Add other production-specific environment variables here
```

For local development, create a `.env.development` file:
```bash
# .env.development (local machine only)
NODE_ENV=development
PORT=4000
DATABASE_URL=mysql://dev_user:dev_password@localhost:3306/mjc_dev
# Add other development-specific environment variables here
```

**Note**: Both `.env.production` and `.env.development` are gitignored for security.

### 2. Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Verify installation
nginx -v
```

### 3. Configure Nginx

Edit `config/nginx/mjc-website.conf` and replace placeholders:
- `YOUR_DOMAIN.com` → your domain name
- `/path/to/MJCWebsite` → absolute path to this project

Then install the configuration:

```bash
# Copy nginx config to sites-available
sudo cp config/nginx/mjc-website.conf /etc/nginx/sites-available/mjc-website

# Create symbolic link to sites-enabled
sudo ln -s /etc/nginx/sites-available/mjc-website /etc/nginx/sites-enabled/

# Remove default nginx config (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Enable nginx to start on boot
sudo systemctl enable nginx

# Restart nginx
sudo systemctl restart nginx
```

### 4. Build the Application

Before deploying, build the application:

```bash
# Run the production build script
./scripts/prod.sh
```

This will:
- Install frontend dependencies
- Build the frontend (TypeScript + Vite)
- Install backend dependencies
- Build the backend (TypeScript compilation)
- Generate Prisma client
- Copy all files to the `build/` directory

### 5. Configure the Systemd Service File

Edit `config/mjc-website.service` and replace placeholders:
- `YOUR_USERNAME` → your system username
- `/path/to/MJCWebsite` → absolute path to this project

### 6. Install the Systemd Service

```bash
# Copy service file to systemd directory
sudo cp config/mjc-website.service /etc/systemd/system/

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable mjc-website

# Start the service now
sudo systemctl start mjc-website
```

### 7. Verify the Services

```bash
# Check service status
sudo systemctl status mjc-website

# View live logs
sudo journalctl -u mjc-website -f

# View application logs (backend)
tail -f logs/backend-*.log
```

## Deployment Workflow

There are two deployment methods available:

### Method 1: Local Build + Remote Deploy (Recommended)

This method builds on your local machine and deploys only the build artifacts to the server. **Much faster** since the server doesn't need to install dependencies or compile code.

#### Initial Setup

1. **Configure the deployment script:**
   ```bash
   # Edit scripts/deploy.sh
   nano scripts/deploy.sh

   # Update these values:
   SERVER_USER="your_username"
   SERVER_HOST="your.server.ip"
   SERVER_PATH="/path/to/MJCWebsite"
   ```

2. **Set up SSH key authentication (if not already done):**
   ```bash
   # Generate SSH key (if you don't have one)
   ssh-keygen -t ed25519

   # Copy to server
   ssh-copy-id your_username@your.server.ip
   ```

3. **Ensure server has the systemd service installed:**
   ```bash
   # On server - one time setup
   ssh your_username@your.server.ip
   sudo cp /path/to/MJCWebsite/config/mjc-website.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable mjc-website
   ```

4. **Create .env.production on server (one time):**
   ```bash
   ssh your_username@your.server.ip
   cd /path/to/MJCWebsite
   nano .env.production
   # Add your production environment variables
   ```

#### Deploying Updates

Simply run the deployment script from your local machine:

```bash
./scripts/deploy.sh
```

This will:
1. Build the application locally
2. Stop the remote service
3. Deploy build artifacts via rsync
4. Deploy .env.production (if exists locally)
5. Start the remote service
6. Show service status

**Benefits:**
- ⚡ Fast deployment (only transfers changed files)
- 🛡️ Server doesn't need build tools (TypeScript, etc.)
- 💻 Can deploy from any developer machine
- 🔄 Easy rollbacks

### Method 2: Server-Side Build

Build and deploy directly on the production server.

#### Initial Deployment

1. **On Production Server:**
   ```bash
   # Clone or pull latest code
   git pull origin main

   # Create .env.production file (if not exists)
   nano .env.production

   # Run production build
   ./scripts/prod.sh

   # Install/update systemd service
   sudo cp config/mjc-website.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable mjc-website
   sudo systemctl start mjc-website
   ```

#### Subsequent Deployments

When you update the code:

1. **Stop the service:**
   ```bash
   sudo systemctl stop mjc-website
   ```

2. **Pull latest code:**
   ```bash
   git pull origin main
   ```

3. **Rebuild the application:**
   ```bash
   ./scripts/prod.sh
   ```

4. **Restart the service:**
   ```bash
   sudo systemctl start mjc-website
   ```

**Drawbacks:**
- ⏱️ Slower (must install dependencies and compile)
- 🔧 Requires build tools on server
- 📦 Larger server footprint

### Quick Restart (no code changes)

If you only need to restart the server without rebuilding:

```bash
sudo systemctl restart mjc-website
```

## Service Management Commands

### Node.js Application Service

```bash
# Start the service
sudo systemctl start mjc-website

# Stop the service
sudo systemctl stop mjc-website

# Restart the service
sudo systemctl restart mjc-website

# Check status
sudo systemctl status mjc-website

# Disable auto-start on boot
sudo systemctl disable mjc-website

# Enable auto-start on boot
sudo systemctl enable mjc-website
```

### Nginx Service

```bash
# Start nginx
sudo systemctl start nginx

# Stop nginx
sudo systemctl stop nginx

# Restart nginx
sudo systemctl restart nginx

# Reload configuration (without downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t
```

### MySQL Service

```bash
# Start MySQL
sudo systemctl start mysql

# Stop MySQL
sudo systemctl stop mysql

# Restart MySQL
sudo systemctl restart mysql

# Check status
sudo systemctl status mysql

# Enable auto-start on boot
sudo systemctl enable mysql

# Disable auto-start on boot
sudo systemctl disable mysql
```

## How It Works

1. **MySQL Auto-Start**: MySQL service starts on boot (enabled during installation)
2. **Nginx Auto-Start**: Nginx starts on boot and listens on ports 80 and 443
3. **Node.js Application Auto-Start**: The systemd service will:
   - Wait for MySQL to be ready (`After=mysql.service`)
   - Run the start script (`scripts/start.sh`)
   - Start the pre-built Node.js server on ports 8080 (HTTP) and 8443 (HTTPS)
   - Auto-restart on failure (with 10-second delay)
   - Log output to `logs/backend-YYYYMMDD.log`
4. **Traffic Flow**: Nginx receives requests on ports 80/443 and proxies them to Node.js on ports 8080/8443

**Note**: The build process (`prod.sh`) is run separately before starting the service. The service only runs the already-built application via `start.sh`.

## Logs

### Application Logs
- **Systemd logs**: `sudo journalctl -u mjc-website`
- **Backend logs**: `logs/backend-YYYYMMDD.log` (daily rotation)
- **Build logs**: Output from `prod.sh` (shown during build)
- **Systemd output**: `logs/systemd-output.log`
- **Systemd errors**: `logs/systemd-error.log`

### Nginx Logs
- **Access logs**: `/var/log/nginx/mjc-website-access.log`
- **Error logs**: `/var/log/nginx/mjc-website-error.log`
- **General nginx logs**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

To view nginx logs in real-time:
```bash
sudo tail -f /var/log/nginx/mjc-website-access.log
sudo tail -f /var/log/nginx/mjc-website-error.log
```

## Environment Variables

The application uses environment-specific `.env` files:
- **Development**: `.env.development` (local machine, gitignored)
- **Production**: `.env.production` (production server, gitignored)

The correct file is loaded automatically based on the `NODE_ENV` environment variable.

### Common Environment Variables
- `NODE_ENV` - Set to `production` or `development`
- `HTTP_PORT` (default: 8080) - HTTP port for Node.js server
- `HTTPS_PORT` (default: 8443) - HTTPS port for Node.js server
- `PORT` (development only, default: 4000) - Development server port
- `DATABASE_URL` - MySQL connection string

**Security Note**: Never commit `.env.production` or `.env.development` to git. These files contain sensitive credentials and are already in `.gitignore`.

## Troubleshooting

### Node.js Application Issues

If the service fails to start:

1. Check logs: `sudo journalctl -u mjc-website -n 50`
2. Check backend logs: `tail -f logs/backend-*.log`
3. Verify paths in `mjc-website.service` are correct
4. Ensure `.env.production` file exists in project root
5. Verify build directory exists: `ls -la build/`
6. Verify MySQL is running: `sudo systemctl status mysql`
7. Test the build manually: `./scripts/prod.sh`
8. Test the start script manually: `./scripts/start.sh`
9. Check if ports 8080/8443 are available: `sudo netstat -tlnp | grep -E '8080|8443'`

### Nginx Issues

If nginx fails to start or proxy correctly:

1. Test configuration: `sudo nginx -t`
2. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify SSL certificate paths in nginx config are correct
4. Ensure ports 80/443 are not in use: `sudo netstat -tlnp | grep -E ':80|:443'`
5. Check if Node.js is running: `curl -k https://localhost:8443`
6. Verify firewall allows ports 80/443: `sudo ufw status`

### Common Issues

**502 Bad Gateway Error**:
- Node.js application is not running
- Check: `sudo systemctl status mjc-website`
- Verify Node.js is listening: `curl -k https://localhost:8443`

**Connection Refused**:
- Nginx is not running
- Check: `sudo systemctl status nginx`
- Firewall blocking ports 80/443

**SSL Certificate Errors**:
- Verify certificate paths in `config/nginx/mjc-website.conf`
- Ensure certificates are readable by nginx user
- Check certificate validity: `openssl x509 -in /path/to/cert.crt -text -noout`
