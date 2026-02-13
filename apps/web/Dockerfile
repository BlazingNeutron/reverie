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

WORKDIR /build/apps/web
RUN --mount=type=secret,id=VITE_SUPABASE_PUBLISHABLE_KEY \
    export VITE_SUPABASE_PUBLISHABLE_KEY=$(cat /run/secrets/VITE_SUPABASE_PUBLISHABLE_KEY) && \
    npm run build

FROM busybox:1.37 AS runner
WORKDIR /app
COPY --from=builder /build/apps/web/dist .

CMD [ "busybox", "httpd", "-f", "-v", "-p", "80" ]