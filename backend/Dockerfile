# syntax=docker/dockerfile:1

# The build needs the whole workspace: the backend imports @moneyverse/contract
# by workspace protocol, and pnpm resolves it from the lockfile at the root.
FROM node:20.19.2-alpine AS build
WORKDIR /repo
RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/contract/package.json packages/contract/
COPY packages/minecraft-core/package.json packages/minecraft-core/
COPY backend/package.json backend/
RUN pnpm install --frozen-lockfile \
      --filter @moneyverse/contract \
      --filter @moneyverse/minecraft-core \
      --filter @moneyverse/backend

COPY packages/contract packages/contract
COPY packages/minecraft-core packages/minecraft-core
COPY backend backend
RUN pnpm --filter @moneyverse/contract build \
 && pnpm --filter @moneyverse/minecraft-core build \
 && pnpm --filter @moneyverse/backend build

# Prune to runtime dependencies. This rewrites node_modules in place, so it
# must come after the build.
RUN pnpm install --frozen-lockfile --prod \
      --filter @moneyverse/contract \
      --filter @moneyverse/minecraft-core \
      --filter @moneyverse/backend

FROM node:20.19.2-alpine
WORKDIR /app
ENV NODE_ENV=production

# The whole store is copied, dot directories included: pnpm reaches a
# transitive dependency through .pnpm, and a copy that omits it leaves every
# symlink in backend/node_modules pointing at nothing. The layout under /app
# mirrors /repo so those relative links still resolve.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages/contract/dist ./packages/contract/dist
COPY --from=build /repo/packages/contract/package.json ./packages/contract/
COPY --from=build /repo/packages/minecraft-core/dist ./packages/minecraft-core/dist
COPY --from=build /repo/packages/minecraft-core/package.json ./packages/minecraft-core/
COPY --from=build /repo/backend/dist ./backend/dist
COPY --from=build /repo/backend/package.json ./backend/
COPY --from=build /repo/backend/node_modules ./backend/node_modules

# Unprivileged: this process holds the database credentials, and nothing it
# does needs root.
RUN addgroup -S moneyverse && adduser -S moneyverse -G moneyverse
USER moneyverse

EXPOSE 3000
# HOST is set explicitly because the application binds loopback by default.
# Inside a container that would make it unreachable from the compose network.
ENV HOST=0.0.0.0
CMD ["node", "backend/dist/main.js"]
