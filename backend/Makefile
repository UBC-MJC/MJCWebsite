.PHONY: backend
backend:
	docker-compose up --detach --build
	npx prisma db push
	npx prisma generate
	pm2 start npm --name "backend" -- start
