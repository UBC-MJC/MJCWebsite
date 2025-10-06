# Development Environment Setup

This guide will help you set up a local development environment for the UBC Mahjong Club website.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/en/download/)
2. **npm** (comes with Node.js)
3. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
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

3. **Install Docker Desktop for Windows** and enable WSL2 integration:
   - Docker Desktop → Settings → Resources → WSL Integration
   - Enable integration with your WSL distribution

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MJCWebsite
```

### 2. Create Environment Files

#### Backend Environment (.env.development)

Create `.env.development` in the project root:

```bash
NODE_ENV=development
PORT=4000

# Database Configuration
DATABASE_DIALECT=mysql
DATABASE_HOST=db
DATABASE_PORT=3306
DATABASE_NAME=mahjong
DATABASE_USER=mahjonguser
DATABASE_PASSWORD=your_dev_password

# Prisma Database URL
DATABASE_URL=mysql://root:your_dev_password@db:3306/mahjong?schema=public

# JWT Secret (generate a random 32+ character string)
ACCESS_TOKEN_SECRET=your_random_secret_key_here

# Email Configuration (ask team member for credentials)
EMAIL_USERNAME=ubcmahjongreset@zohomail.ca
EMAIL_PASSWORD=
FROM_EMAIL="UBC Mahjong" <ubcmahjongreset@zohocloud.ca>
```

**Important:**
- Replace `your_dev_password` with any password (same password in both places)
- Replace `your_random_secret_key_here` with a random 32+ character string
- Ask a team member for the email password

#### Generate a Random Secret

```bash
# Linux/macOS/WSL
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Install Dependencies

The Docker setup will handle dependency installation automatically, but if you need to install locally:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Development Server

### Using Docker (Recommended)

```bash
# From project root
./scripts/dev.sh
```

This script will:
1. Build Docker images (first time only)
2. Start all services (frontend, backend, database)
3. Enable hot-reloading for development

**First-time setup:**

If this is your first time running the application, you need to initialize the database:

1. **Create database tables:**
   - Open Docker Desktop
   - Navigate to the backend container
   - Open the "Exec" tab
   - Run: `npx prisma db push`

2. **Create an admin user:**
   - Register a new account at [http://localhost:3000](http://localhost:3000)
   - Open the database container in Docker Desktop
   - Go to the "Exec" tab
   - Run:
     ```bash
     mysql -u root -p
     # Enter your password from .env.development

     USE mahjong;
     UPDATE Player SET Admin = 1 WHERE id = 1;
     # Replace '1' with your user ID
     exit
     ```

### Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)

## Docker Commands

```bash
# Start development environment
./scripts/dev.sh

# Or manually with make commands (in backend directory):
make build    # Build Docker images (only needed once or when dependencies change)
make up       # Start services
make down     # Stop services

# View logs
docker logs <container-name> -f

# Rebuild after dependency changes
make build
make up
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
# Via Docker
docker exec -it <db-container-name> mysql -u root -p

# Then enter your database password
USE mahjong;
SHOW TABLES;
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

### Docker Issues

If you encounter database connection or Docker issues, try these steps in order:

1. Restart all services: `make down && make up`
2. Switch to `origin/main` branch
3. Restart Docker Engine
4. Clean Docker: `docker system prune -a` (removes all unused containers/images)
5. Restart your machine
6. Reset Docker to factory settings (Docker Desktop → Settings → Troubleshoot)
7. Reinstall Docker Desktop
8. Reclone the repository
9. Ask for help in the team chat

### Port Already in Use

```bash
# Find process using port 3000 or 4000
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### Database Connection Errors

- Verify database container is running: `docker ps`
- Check database credentials in `.env.development`
- Ensure `DATABASE_HOST=db` (not `localhost` in Docker setup)

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
- [Docker Documentation](https://docs.docker.com)
- [Team Development Guide](https://docs.google.com/document/d/1FmSUD-EqHhf2XEkG1CkzElLQ91N8OO2Ojf6pMJxwn-s/edit?usp=sharing)

## Getting Help

- Check the [Troubleshooting](#troubleshooting) section
- Review existing GitHub issues
- Ask in the team chat
- Contact the tech lead
