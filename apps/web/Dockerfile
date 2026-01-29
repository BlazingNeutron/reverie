FROM node:22 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN --mount=type=secret,id=VITE_SUPABASE_PUBLISHABLE_KEY \
    export VITE_SUPABASE_PUBLISHABLE_KEY=$(cat /run/secrets/VITE_SUPABASE_PUBLISHABLE_KEY) && \
    npm run build

FROM busybox:1.37 AS runner
WORKDIR /app
COPY --from=builder /app/dist .

CMD [ "busybox", "httpd", "-f", "-v", "-p", "80" ]