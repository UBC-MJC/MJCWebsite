.PHONY: develop
develop:
	make -C backend/ backend
	make -C frontend/ frontend
.PHONY: production
production:
	make -C backend/ backend-production
	make -C frontend/ frontend-production
.PHONY: build
build:
	docker-compose -f docker-compose.dev.yml build
.PHONY: build-prod
build-prod:
	docker-compose -f docker-compose.prod.yml build
.PHONY: up
up:
	docker-compose -f docker-compose.dev.yml up -d
.PHONY: up-prod
up-prod:
	docker-compose -f docker-compose.prod.yml up -d
.PHONY: down
down:
	docker-compose -f docker-compose.dev.yml down
.PHONY: down-prod
down-prod:
	docker-compose -f docker-compose.prod.yml down
