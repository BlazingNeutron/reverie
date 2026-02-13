FROM node:22 AS builder

COPY --from=root package.json /build/package.json
COPY --from=root package-lock.json /build/package-lock.json
COPY --from=root turbo.json /build/turbo.json

WORKDIR /build
RUN npm install
COPY --from=root /apps /build/apps
COPY --from=root /packages /build/packages
RUN npm install
RUN npm run build

FROM node:22 AS runner
WORKDIR /app
COPY --from=builder /build/apps/api .

CMD [ "npm", "run", "start" ]