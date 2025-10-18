# UBC Mahjong Club Website

A full-stack web application for managing the UBC Mahjong Club, including player statistics, game tracking, leaderboards, and tournament management.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Prisma ORM
- **Deployment**: Nginx reverse proxy, systemd service

## Documentation

- **[Development Setup](DEVELOPMENT.md)** - Local development environment setup
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Development Guide](https://docs.google.com/document/d/1FmSUD-EqHhf2XEkG1CkzElLQ91N8OO2Ojf6pMJxwn-s/edit?usp=sharing)** - Additional development resources

## Quick Start

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed local development setup instructions.

## Project Structure

```
MJCWebsite/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
│   ├── src/          # TypeScript source files
│   └── prisma/       # Database schema and migrations
├── config/           # Configuration files
│   ├── nginx/        # Nginx reverse proxy config
│   └── mjc-website.service  # Systemd service file
├── scripts/          # Build and deployment scripts
│   ├── dev.sh        # Development server launcher
│   ├── prod.sh       # Production build script
│   ├── start.sh      # Production server starter
│   └── deploy.sh     # Automated deployment script
└── build/            # Production build output (gitignored)
```

## Scripts

### Development
```bash
./scripts/dev.sh      # Start development server locally
```

### Production
```bash
./scripts/prod.sh     # Build for production
./scripts/start.sh    # Start production server
./scripts/deploy.sh   # Deploy to remote server
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally using `./scripts/dev.sh`
4. Submit a pull request

## License

This project is maintained by the UBC Mahjong Club.
