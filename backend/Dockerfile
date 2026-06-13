FROM node:22-alpine AS deps

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile --filter system-tandas-backend...

FROM deps AS build

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/system_tandas_build

COPY backend backend

RUN pnpm --filter system-tandas-backend build

FROM deps AS production-dependencies

RUN CI=true pnpm --dir backend prune --prod

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=production-dependencies /app/node_modules node_modules
COPY --from=production-dependencies /app/backend/node_modules backend/node_modules
COPY backend/package.json backend/package.json
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/backend/generated backend/generated
COPY --from=build /app/backend/prisma backend/prisma
COPY --from=build /app/backend/prisma.config.ts backend/prisma.config.ts

WORKDIR /app/backend

EXPOSE 3000

CMD ["sh", "-c", "if [ \"$SERVICE_ROLE\" = \"worker\" ]; then exec node dist/src/workers/tanda-build.worker.js; else node_modules/.bin/prisma migrate deploy && exec node dist/src/server.js; fi"]
