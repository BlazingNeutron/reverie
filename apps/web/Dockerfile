FROM node:22 AS builder

COPY package.json /build/package.json
COPY package-lock.json /build/package-lock.json
COPY turbo.json /build/turbo.json

WORKDIR /build
RUN npm install

COPY /apps /build/apps
COPY /packages /build/packages

RUN npm install
RUN npm run build

WORKDIR /build/apps/web
RUN npm run build


FROM nginx:alpine AS runner

WORKDIR /app
COPY --from=builder /build/apps/web/dist /usr/share/nginx/html

COPY --from=builder /build/apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]