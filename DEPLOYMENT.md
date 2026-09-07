# Production deployment

Use Bash on the server, from the checkout root, as the account that owns the application. The current installation uses `/root/MJCWebsite`; use a dedicated application account for new installations.

Nginx terminates HTTPS on port 443 and proxies to Express over HTTP on port 8080. Express serves the SPA and `/api/*`; Prisma connects to MySQL. Allow public access to ports 80/443 and restrict the backend/database ports.

## First installation

### Host and database

Install Node 24 for the application account (`nvm install && nvm use` from the checkout if using NVM). On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install git mysql-server nginx curl openssl
sudo systemctl enable --now mysql
git clone https://github.com/UBC-MJC/MJCWebsite.git
cd MJCWebsite
sudo mysql
```

In MySQL, replace the password and run:

```sql
CREATE DATABASE mahjong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mahjonguser'@'localhost' IDENTIFIED BY 'your_production_password';
GRANT ALL PRIVILEGES ON mahjong.* TO 'mahjonguser'@'localhost';
EXIT;
```

### Environment

Create `.env.production` in the checkout root:

```dotenv
NODE_ENV=production
PORT=8080
DATABASE_URL="mysql://mahjonguser:encoded_password@localhost:3306/mahjong"
ACCESS_TOKEN_SECRET="replace_with_a_random_secret"
EMAIL_USERNAME="your_mail_account"
EMAIL_PASSWORD="your_mail_password"
FROM_EMAIL="UBC Mahjong <your_mail_account>"
```

Generate the secret with `openssl rand -hex 32`, percent-encode database URL credentials, and run `chmod 600 .env.production`. Email uses `smtp.zohocloud.ca:465`.

The build commands below copy this configuration to `build/.env` for Prisma/authentication and `build/.env.production` for application startup. Keep credentials private and clear conflicting environment variables from the deployment shell.

The build script also sources root `.env` as Bash. Use an empty file on a new installation and review any existing contents before building.

### Build and start

For an empty database, run:

```bash
(
  set -e -o pipefail
  source scripts/use-node.sh
  test -s .env.production
  touch .env
  mkdir -p logs
  npm_config_include=dev ./scripts/prod.sh 2>&1 | tee "logs/deploy-$(date +%Y%m%d-%H%M%S).log"
  install -m 600 .env.production build/.env
  install -m 600 .env.production build/.env.production
  (cd build && npx --no-install prisma migrate deploy)
)
```

For an existing database, resolve [migration errors](#migration-errors) before proceeding.

Create an edited copy of `config/mjc-website.service`, replacing `YOUR_USERNAME` and every `/path/to/MJCWebsite`. The service account needs access to Node, the build, environment files, and writable `logs/`. Install the edited copy:

```bash
sudo cp /path/to/edited/mjc-website.service /etc/systemd/system/mjc-website.service
sudo systemctl daemon-reload
sudo systemctl enable --now mjc-website
```

### HTTPS

Provision the domain's certificate and key. Edit a copy of `config/nginx/mjc-website.conf` with the domain, certificate paths, and project paths. Keep `proxy_pass` aligned with the backend `PORT`.

```bash
sudo cp /path/to/edited/mjc-website.conf /etc/nginx/sites-available/mjc-website
sudo ln -s /etc/nginx/sites-available/mjc-website /etc/nginx/sites-enabled/mjc-website
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

Create the symlink once. Disable any conflicting default site before testing. Configure DNS and certificate renewal, then run the [verification checks](#verification).

## Deploy an update

### Normal path

From a clean checkout on `main` with first-time setup complete, run the block below. Schedule downtime while the application rebuilds. For schema changes, review the migration SQL and take a [backup](#add-a-backup) first.

```bash
(
  set -e
  git pull --ff-only origin main
  source scripts/use-node.sh
  test -s .env.production
  sudo systemctl stop mjc-website
  npm_config_include=dev ./scripts/prod.sh
  install -m 600 .env.production build/.env.production
  (cd build && npx --no-install prisma migrate deploy)
  sudo systemctl start mjc-website
)
```

Then run the [verification checks](#verification). If the build or migration fails, the service stays stopped; fix the error or follow [recovery](#recovery).

`prod.sh` builds the application and generates Prisma Client; the separate `migrate deploy` step applies committed SQL migrations using `build/.env`.

### Add a backup

Run this **before the normal path**, while the checkout still matches the running build. Adjust the database name as needed; this assumes local MySQL administrative access through `sudo`.

```bash
(
  set -e
  umask 077
  MJC_BACKUP_DIR=$(mktemp -d "../mjc-deploy-backup.XXXXXXXX")
  MJC_BACKUP_DIR=$(cd "$MJC_BACKUP_DIR" && pwd)
  cp -a build scripts .nvmrc "$MJC_BACKUP_DIR/"
  git rev-parse HEAD > "$MJC_BACKUP_DIR/commit.txt"
  sudo mysqldump --single-transaction --routines --triggers --events --no-tablespaces \
    mahjong > "$MJC_BACKUP_DIR/database.sql"
  test -s "$MJC_BACKUP_DIR/database.sql"
  printf 'Keep this backup path: %s\n' "$MJC_BACKUP_DIR"
)
```

### Add pre-deployment checks

Run before the normal path to inspect incoming changes and the deployed migration history:

```bash
git fetch origin &&
git log --oneline HEAD..origin/main &&
git diff HEAD origin/main -- backend/prisma/ &&
(source scripts/use-node.sh && cd build && npx --no-install prisma migrate status)
```

### Save build output

Replace the `prod.sh` line in the normal path with:

```bash
set -o pipefail
mkdir -p logs
npm_config_include=dev ./scripts/prod.sh 2>&1 | tee "logs/deploy-$(date +%Y%m%d-%H%M%S).log"
```

## Verification

Replace the hostname with your domain:

```bash
sudo systemctl status mjc-website --no-pager
curl --fail --silent --show-error -o /dev/null -w '%{http_code}\n' https://YOUR_DOMAIN.com/
curl --fail --silent --show-error https://YOUR_DOMAIN.com/api/seasons
```

Check the pages and API routes affected by the release. For a quick restart of the existing build, run `sudo systemctl restart mjc-website`.

## Migration errors

Back up before reconciling a failed migration or existing database. Compare `_prisma_migrations`, the actual schema, and the committed SQL. If a migration's changes are already present, record it from `build/`:

```bash
npx --no-install prisma migrate resolve --applied MIGRATION_DIRECTORY_NAME
```

Use this only after verifying those changes. See [baselining](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/baselining) and [failed migration recovery](https://docs.prisma.io/docs/orm/v6/prisma-migrate/workflows/patching-and-hotfixing). Never reset the production database to resolve migration history.

## Recovery

Check that the previous application is compatible with any SQL already applied. Restore matching startup scripts and Node requirements first if they changed, then set the actual backup path below:

```bash
(
  set -e
  MJC_BACKUP_DIR=/absolute/path/from/deployment/output
  test -f "$MJC_BACKUP_DIR/commit.txt"
  test -d "$MJC_BACKUP_DIR/build"
  diff -qr "$MJC_BACKUP_DIR/scripts" scripts
  cmp "$MJC_BACKUP_DIR/.nvmrc" .nvmrc
  sudo systemctl stop mjc-website
  MJC_FAILED_DIR=$(mktemp -d ../mjc-failed-release.XXXXXXXX)
  if [ -d build ]; then mv build "$MJC_FAILED_DIR/build"; fi
  cp -a "$MJC_BACKUP_DIR/build" build
  sudo systemctl start mjc-website
)
```

Repeat verification. Record the restored commit from `commit.txt` and reconcile the checkout before the next deployment.

Restoring a build leaves database changes in place. A database restore loses writes since the backup; plan and validate it separately.

## Logs

- Application: `logs/backend-YYYYMMDD.log`, dated when the process starts.
- Service: `sudo journalctl -u mjc-website -n 50 --no-pager` and `logs/systemd-*.log`.
- Build: the `tee` log saved by the deployment commands.
- Nginx: `/var/log/nginx/mjc-website-access.log` and `mjc-website-error.log`.

For a 502, check the service and `http://127.0.0.1:8080/api/seasons`. For HTTPS/configuration errors, run `sudo nginx -t` and inspect the Nginx error log.
