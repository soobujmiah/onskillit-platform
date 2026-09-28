# PHASE-01 foundation image. Builds the portable OCI artifact described
# in ADR 0006/0009: one versioned image runs either the web process
# (default) or the worker process (PROCESS_ROLE=worker), selected at
# `docker run` time. GitHub Actions builds and smoke-tests this image;
# it is not deployed anywhere by this Dockerfile.

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/src/worker ./src/worker
COPY --from=build /app/src/db ./src/db
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
