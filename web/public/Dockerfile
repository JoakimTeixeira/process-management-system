FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
COPY --chown=root:root --chmod=0444 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=root:root /app/dist/public/browser /usr/share/nginx/html
USER nginx

EXPOSE 8080
