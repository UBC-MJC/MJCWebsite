# Development setup

Use Node 24, npm, MySQL 8, and Git. Run commands from the repository root in Bash; Windows users can use WSL.

## Setup

Clone the repository and select Node with NVM:

```bash
git clone https://github.com/UBC-MJC/MJCWebsite.git
cd MJCWebsite
nvm install
nvm use
```

On Ubuntu/WSL, install MySQL and open its prompt:

```bash
sudo apt update
sudo apt install mysql-server
sudo service mysql start
sudo mysql
```

Create a local database and account, replacing the password:

```sql
CREATE DATABASE mahjong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mahjonguser'@'localhost' IDENTIFIED BY 'your_dev_password';
GRANT ALL PRIVILEGES ON mahjong.* TO 'mahjonguser'@'localhost';
EXIT;
```

Create `.env.development` in the repository root:

```dotenv
NODE_ENV=development
PORT=4000
DATABASE_URL="mysql://mahjonguser:your_dev_password@localhost:3306/mahjong"
ACCESS_TOKEN_SECRET="replace_with_a_random_secret"

# Required for password-reset email; obtain test credentials from the team.
EMAIL_USERNAME="your_test_mail_account"
EMAIL_PASSWORD="your_test_mail_password"
FROM_EMAIL="UBC Mahjong <your_test_mail_account>"
```

Generate the secret with `openssl rand -hex 32`. Percent-encode special characters in the database URL credentials.

Copy the configuration to `backend/.env`, which Prisma and the authentication module use. Keep both files synchronized and private:

```bash
cp .env.development backend/.env
chmod 600 .env.development backend/.env
```

Install dependencies, apply migrations, and generate Prisma Client:

```bash
(cd frontend && npm ci) &&
(
  cd backend &&
  npm ci &&
  npx --no-install prisma migrate deploy &&
  npx --no-install prisma generate
)
```

## Run

```bash
./scripts/dev.sh
```

Open `http://localhost:3000`; the API uses `http://localhost:4000/api`. Both servers reload source changes. Press `Ctrl+C` to stop.

For separate terminals, run `npm run dev` in `backend/` and `npm start` in `frontend/`. Keep ports 3000/4000 aligned with the frontend API URL and backend CORS settings.

To make your registered account a local admin, connect with `mysql -u mahjonguser -p mahjong` and run:

```sql
SELECT id, username, email FROM Player;
UPDATE Player SET admin = TRUE WHERE id = 'paste_your_account_id_here';
```

## Update after a pull

Refresh dependencies and apply teammates' committed migrations before restarting the servers:

```bash
git pull --ff-only &&
(cd frontend && npm ci) &&
(
  cd backend &&
  npm ci &&
  npx --no-install prisma migrate deploy &&
  npx --no-install prisma generate
)
```

## Schema changes

Use your own local database. Creating migrations requires a Prisma shadow database; on a MySQL instance dedicated to local development, an administrator can grant:

```sql
GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'mahjonguser'@'localhost';
```

These instance-wide privileges are for local development only. See [shadow database setup](https://docs.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database) for alternatives.

1. Apply teammates' migrations, then edit `backend/prisma/schema.prisma`.
2. From `backend/`, create the migration:

   ```bash
   npx --no-install prisma migrate dev --name describe_change --create-only
   ```

3. Review the generated SQL, including any backfills needed to preserve data, then apply it:

   ```bash
   npx --no-install prisma migrate dev
   npx --no-install prisma generate
   ```

4. Commit `schema.prisma` and the new migration directory together. Keep previously applied migrations unchanged.

### Preserve local data

Review migration SQL before applying it to valuable data. If Prisma asks to reset, stop and back up first:

```bash
(
  set -e
  umask 077
  MJC_LOCAL_BACKUP=$(mktemp /tmp/mjc-local-backup.XXXXXXXX.sql)
  mysqldump -u mahjonguser -p --single-transaction --no-tablespaces mahjong > "$MJC_LOCAL_BACKUP"
  test -s "$MJC_LOCAL_BACKUP"
  printf 'Backup: %s\n' "$MJC_LOCAL_BACKUP"
)
```

Keep the backup in durable private storage. Inspect `prisma migrate status`, the actual schema, and the migration SQL. Record a migration with `prisma migrate resolve --applied MIGRATION_DIRECTORY_NAME` only after verifying that its changes already exist. See [baselining](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/baselining) for the reconciliation process.

`migrate reset` deletes data. Reserve it for disposable local databases.

## Checks

Run before opening a pull request:

```bash
(cd frontend && npm run build && npm run lint) &&
(
  cd backend &&
  npx --no-install prisma generate &&
  npm run build &&
  npm test -- --run &&
  npm run lint
)
```

Backend tests use Vitest and mock Prisma in service tests. Use `npm test` for watch mode or `npm run coverage` in `backend/`. Run `make format` to format both packages, then review the diff.

When adding dependencies, run `npm install PACKAGE_NAME` in the relevant package and commit its `package.json` and `package-lock.json`.

## Troubleshooting

- **Database connection:** check the MySQL service, credentials, and both environment files.
- **Missing dependencies:** run `npm ci` in the affected package.
- **Missing Prisma types:** run `npx --no-install prisma generate` in `backend/`.
- **Port conflict:** inspect `lsof -i :3000` and `lsof -i :4000`, then stop the owning development process.
