FROM node:25 AS base


FROM base AS prepare
WORKDIR /app
RUN npm install -g turbo
COPY package*.json /app
COPY turbo.json /app
COPY packages /app/packages
COPY apps /app/apps
RUN turbo prune api --docker


FROM base AS builder
WORKDIR /app
COPY --from=prepare /app/out/json/ .
RUN npm install 
COPY --from=prepare /app/out/full/ .
RUN npm run build


FROM node:25-alpine AS runner
USER node
WORKDIR /app

COPY --from=builder /app .

WORKDIR /app/apps/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD [ "node", "dist/app.js" ]
