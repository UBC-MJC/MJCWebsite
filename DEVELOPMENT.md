# Development Environment Setup

This guide will help you set up a local development environment for the UBC Mahjong Club website.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/en/download/)
2. **npm** (comes with Node.js)
3. **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
4. **Git** - [Download](https://git-scm.com/downloads)

### Windows Users - WSL Setup

For Windows development, it's recommended to use Windows Subsystem for Linux (WSL2):

1. **Install WSL2:**
   ```bash
   wsl --install
   ```
   This installs Ubuntu (latest version, currently 22.04)

2. **Set up Node.js on WSL:**
   Follow [Microsoft's guide](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl) to install Node.js and npm on WSL.

3. **Install MySQL on WSL:**
   ```bash
   sudo apt update
   sudo apt install mysql-server
   sudo service mysql start
   ```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MJCWebsite
```

### 2. Set Up MySQL Database

Create a database and user for development:

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE mahjong;
CREATE USER 'mahjonguser'@'localhost' IDENTIFIED BY 'your_dev_password';
GRANT ALL PRIVILEGES ON mahjong.* TO 'mahjonguser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Create Environment Files

#### Development Environment (.env.development)

Create `.env.development` in the project root:

```bash
NODE_ENV=development
PORT=4000

# Database Configuration
DATABASE_DIALECT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=mahjong
DATABASE_USER=mahjonguser
DATABASE_PASSWORD=your_dev_password

# Prisma Database URL
DATABASE_URL=mysql://mahjonguser:your_dev_password@localhost:3306/mahjong?schema=public

# JWT Secret (generate a random 32+ character string)
ACCESS_TOKEN_SECRET=your_random_secret_key_here

# Email Configuration (ask team member for credentials)
EMAIL_USERNAME=ubcmahjongreset@zohomail.ca
EMAIL_PASSWORD=
FROM_EMAIL="UBC Mahjong" <ubcmahjongreset@zohocloud.ca>
```

**Important:**
- Replace `your_dev_password` with the password you set for the MySQL user
- Replace `your_random_secret_key_here` with a random 32+ character string
- Ask a team member for the email password

#### Generate a Random Secret

```bash
# Linux/macOS/WSL
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Initialize the Database

Run Prisma migrations to create database tables:

```bash
cd backend
npx prisma migrate deploy

# Or for development, push schema directly
npx prisma db push
```

### 5. Create an Admin User

After starting the server for the first time:

1. Register a new account at [http://localhost:3000](http://localhost:3000)
2. Find your user ID and grant admin permissions:

```bash
mysql -u mahjonguser -p
# Enter your password

USE mahjong;
SELECT id, Username FROM Player;
UPDATE Player SET Admin = 1 WHERE id = 1;
# Replace '1' with your user ID
EXIT;
```

## Running the Development Server

### Start Development Servers

```bash
# From project root
./scripts/dev.sh
```

This script will:
1. Install dependencies automatically (first time or when package.json changes)
2. Generate Prisma client (if needed)
3. Start both frontend and backend servers with hot-reloading
4. Show color-coded logs for each server

### Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

### Stop Development Servers

Press `Ctrl+C` in the terminal running `dev.sh` - this will stop both servers gracefully.

## Manual Development (Without dev.sh)

If you prefer to run servers separately:

```bash
# Terminal 1 - Backend
cd backend
npm install
npx prisma generate
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (dev)
npx prisma db push

# Create a migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Direct Database Access

```bash
# Access MySQL directly
mysql -u mahjonguser -p

# Then enter your database password
USE mahjong;
SHOW TABLES;
SELECT * FROM Player;
```

## Project Structure

```
MJCWebsite/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── app.ts          # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── .env.development        # Development environment variables
```

## Common Development Tasks

### Making Code Changes

Changes are automatically hot-reloaded:
- **Frontend:** Vite dev server auto-refreshes
- **Backend:** Nodemon restarts server on file changes

### Adding Dependencies

```bash
# Frontend
cd frontend
npm install package-name

# Backend
cd backend
npm install package-name

# After adding backend dependencies, rebuild Docker
make down
make build
make up
```

### Database Schema Changes

1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma db push` (for development)
3. Or create a migration: `npx prisma migrate dev --name change_description`

## Troubleshooting

### MySQL Connection Issues

If you can't connect to MySQL:

1. **Check if MySQL is running:**
   ```bash
   # macOS
   brew services list

   # Linux/WSL
   sudo service mysql status

   # Windows
   # Check Services app for MySQL service
   ```

2. **Start MySQL if needed:**
   ```bash
   # macOS
   brew services start mysql

   # Linux/WSL
   sudo service mysql start

   # Windows
   net start MySQL80
   ```

3. **Verify credentials:**
   - Check `.env.development` matches your MySQL user/password
   - Try logging in manually: `mysql -u mahjonguser -p`

4. **Reset MySQL password if needed:**
   ```bash
   mysql -u root -p
   ALTER USER 'mahjonguser'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

### Port Already in Use

```bash
# Find process using port 3000 or 4000
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### dev.sh Script Issues

If `dev.sh` fails to start:

1. **Make script executable:**
   ```bash
   chmod +x scripts/dev.sh
   ```

2. **Check for syntax errors:**
   ```bash
   bash -n scripts/dev.sh
   ```

3. **Run servers manually** (see [Manual Development](#manual-development-without-devsh) section)

### Prisma Client Not Found

```bash
cd backend
npx prisma generate
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend server port | `4000` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `ACCESS_TOKEN_SECRET` | JWT signing secret | Random 32+ char string |
| `EMAIL_USERNAME` | Email service username | Team credential |
| `EMAIL_PASSWORD` | Email service password | Team credential |

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Vite Documentation](https://vitejs.dev)
- [Team Development Guide](https://docs.google.com/document/d/1FmSUD-EqHhf2XEkG1CkzElLQ91N8OO2Ojf6pMJxwn-s/edit?usp=sharing)

## Getting Help

- Check the [Troubleshooting](#troubleshooting) section
- Review existing GitHub issues
