.PHONY: build build-prod up up-prod down down-prod
build:
	docker-compose -f docker-compose.dev.yml build
build-prod:
	docker-compose -f docker-compose.prod.yml build
up:
	docker-compose -f docker-compose.dev.yml up -d
up-prod:
	docker-compose -f docker-compose.prod.yml up -d
down:
	docker-compose -f docker-compose.dev.yml down
down-prod:
	docker-compose -f docker-compose.prod.yml down
rebuild-prod:
	docker-compose -f docker-compose.prod.yml down
	docker-compose -f docker-compose.prod.yml build
	docker-compose -f docker-compose.prod.yml up -d
format:
	npm --prefix ./backend run format
	npm --prefix ./frontend run format
