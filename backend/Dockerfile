FROM node:22-alpine AS deps

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile --filter system-tandas-backend...

FROM deps AS build

COPY backend backend

RUN pnpm --filter system-tandas-backend build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json

RUN pnpm install --frozen-lockfile --prod --filter system-tandas-backend...

COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/backend/generated backend/generated
COPY --from=build /app/backend/prisma backend/prisma

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
