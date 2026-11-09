FROM node:22-bookworm-slim AS builder

ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY package*.json ./
# The npm version bundled with the base image rejects this lockfile, while npm 11 installs it
# successfully. Pin npm in the build stage so Docker builds stay reproducible.
RUN npm install -g npm@11.13.0 \
    && npm ci --ignore-scripts --audit=false

COPY . .
RUN npm run build

FROM builder AS verification

RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 CMD node -e "const http=require('node:http'); const port=process.env.PORT || 3000; const req=http.get({host:'127.0.0.1', port, path:'/health', timeout:4000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); });"

CMD ["npm", "run", "start:prod"]

FROM node:22-bookworm-slim AS runtime

ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install -g npm@11.13.0 \
    && npm ci --omit=dev --ignore-scripts --audit=false \
    && npm audit --omit=dev --audit-level=low \
    && npm cache clean --force --loglevel=error

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 CMD node -e "const http=require('node:http'); const port=process.env.PORT || 3000; const req=http.get({host:'127.0.0.1', port, path:'/health', timeout:4000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); });"

CMD ["npm", "run", "start:prod"]
