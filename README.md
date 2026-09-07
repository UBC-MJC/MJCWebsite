# UBC Mahjong Club Website

A web application for club games, player statistics, leaderboards, and tournaments.

## Stack

- Frontend: React, TypeScript, React Router (SPA), Vite, Material UI, and TanStack Query.
- Backend: Node.js, Express, TypeScript, and Prisma ORM 6 with MySQL.
- Production: Nginx serves HTTPS and proxies to Express; systemd manages the application.

## Get started

Use Node 24 from [.nvmrc](.nvmrc). Follow [Development setup](DEVELOPMENT.md), then run:

```bash
./scripts/dev.sh
```

Frontend: `http://localhost:3000` · API: `http://localhost:4000/api`

For production setup and releases, follow the [Deployment guide](DEPLOYMENT.md).

## Project structure

| Directory | Contents |
| --- | --- |
| `frontend/src/` | Routes, components, API clients, and hooks |
| `backend/src/` | Controllers, services, middleware, and tests |
| `backend/prisma/` | Database schema and migrations |
| `config/` | Nginx and systemd templates |
| `scripts/` | Development, build, startup, and Node helpers |
| `build/` | Generated production application |

## Contributing

Create a branch from `main`, make your changes, run the [checks](DEVELOPMENT.md#checks), and submit a pull request. Commit schema changes with their migration SQL, and dependency changes with the relevant lockfile.
