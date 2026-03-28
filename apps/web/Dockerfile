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
RUN npm run build


FROM nginx:alpine AS runner

WORKDIR /app
COPY --from=builder /build/apps/web/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# RUN chown -R nginx:nginx /usr/share/nginx/html && \
#     chmod -R 755 /usr/share/nginx/html && \
#     mkdir -p /var/log/nginx && \
#     chown -R nginx:nginx /var/log/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]