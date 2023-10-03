.PHONY: backend backend-production
backend:
	export NODE_ENV=development
	npm install
	npx prisma db push
	npx prisma generate
	pm2 start npm --name "backend" -- start
backend-production:
	export NODE_ENV=production
	npm install --omit=dev
	npx prisma db push
	npx prisma generate
	pm2 start npm --name "backend" -- start -- --production
