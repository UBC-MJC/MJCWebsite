.PHONY: backend
backend:
	docker-compose up --detach --build
	npm install
	npx prisma db push
	npx prisma generate
	pm2 start npm --name "backend" -- start
