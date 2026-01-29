FROM node:22 AS builder
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM busybox:1.37 AS runner
WORKDIR /app
COPY --from=builder /app/dist .

CMD [ "busybox", "httpd", "-f", "-v", "-p", "80" ]