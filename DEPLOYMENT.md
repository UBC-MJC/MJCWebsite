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

Update your `.env` file with the database credentials:
```
DATABASE_NAME=your_database_name
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_PORT=3306
```

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

### 4. Configure the Systemd Service File

Edit `config/mjc-website.service` and replace placeholders:
- `YOUR_USERNAME` → your system username
- `/path/to/MJCWebsite` → absolute path to this project

### 5. Install the Systemd Service

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

### 6. Verify the Services

```bash
# Check service status
sudo systemctl status mjc-website

# View live logs
sudo journalctl -u mjc-website -f

# View application logs
tail -f logs/production-*.log
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
   - Run the production deployment script
   - Build frontend and backend
   - Start the Node.js server on ports 8080 (HTTP) and 8443 (HTTPS)
   - Auto-restart on failure
   - Log output to `logs/` directory
4. **Traffic Flow**: Nginx receives requests on ports 80/443 and proxies them to Node.js on ports 8080/8443

## Logs

### Application Logs
- **Systemd logs**: `sudo journalctl -u mjc-website`
- **Application logs**: `logs/production-YYYYMMDD-HHMMSS.log`
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

The application uses the following environment variables for port configuration:
- `HTTP_PORT` (default: 8080) - HTTP port for Node.js server
- `HTTPS_PORT` (default: 8443) - HTTPS port for Node.js server

These can be set in your `.env` file if you need different ports.

## Troubleshooting

### Node.js Application Issues

If the service fails to start:

1. Check logs: `sudo journalctl -u mjc-website -n 50`
2. Verify paths in `mjc-website.service` are correct
3. Ensure `.env` file exists in project root
4. Verify MySQL is running: `sudo systemctl status mysql`
5. Test the script manually: `./scripts/prod.sh`
6. Check if ports 8080/8443 are available: `sudo netstat -tlnp | grep -E '8080|8443'`

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
