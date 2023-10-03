.PHONY: frontend frontend-production
frontend:
	npm install
	pm2 start npm --name "frontend" -- start
frontend-production:
	npm install --omit=dev
	pm2 start npm --name "frontend" -- start
