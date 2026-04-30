FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
# npm 10.8.2 in node:20-bookworm-slim rejects this lockfile, while npm 11 installs it
# successfully. Pin npm in the build stage so Docker builds stay reproducible.
RUN npm install -g npm@11.13.0 && npm ci

COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy `src`, `migrations`, `seeds`, and `scripts` so the API container
# can run scripts to manually run database migrations and seed the database.
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/nest-cli.json ./nest-cli.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.build.json ./tsconfig.build.json

RUN mkdir -p /app/uploads

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 CMD node -e "const http=require('node:http'); const port=process.env.PORT || 3000; const req=http.get({host:'127.0.0.1', port, path:'/health', timeout:4000}, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); });"

CMD ["npm", "run", "start:prod"]
