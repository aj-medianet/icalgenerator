build:
	docker-compose build

run:
	docker-compose up

rund:
	docker-compose up -d

br:
	docker volume prune -f
	docker-compose up -d --build

prod:
	docker volume prune -f
	docker-compose -f prod-docker-compose.yml up -d --build
