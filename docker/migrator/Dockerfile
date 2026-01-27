FROM postgres:15-alpine

COPY --from=migrations . /migrations
COPY ./scripts /scripts

ENTRYPOINT [ "/scripts/run-migrations.sh" ]