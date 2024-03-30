db-up:
	docker-compose --profile=db --env-file=.env up -d --force-recreate

db-migrate:
	npm run db:migrate:dev

app-start-dev:
	npm run start:dev

build-app-image:
	docker-compose --profile=build-local build

app-start-image:
	docker-compose  --profile=app up -d --force-recreate