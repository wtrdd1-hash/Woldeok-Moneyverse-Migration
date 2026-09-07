# syntax=docker/dockerfile:1

# The build needs the whole workspace: the frontend imports
# @moneyverse/contract by workspace protocol, and pnpm resolves it from the
# lockfile at the root.
FROM node:20.19.2-alpine AS build
WORKDIR /repo
RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json .npmrc ./
COPY packages/contract/package.json packages/contract/
COPY frontend/package.json frontend/
# The root project owns the shared ESLint configuration and its plugins.
# Include it explicitly: a frontend-only filtered install can leave Next's
# build-time lint step unable to resolve eslint-plugin-react-hooks.
RUN pnpm install --frozen-lockfile --filter woldeok-moneyverse --filter @moneyverse/contract --filter @moneyverse/frontend

COPY eslint.config.mjs ./
COPY packages/contract packages/contract
COPY frontend frontend

# next/font downloads its faces at build time, so the build needs the network
# once. The files are then served from this origin and no page load makes a
# third-party request.
#
# APP_BASE_URL is baked in here because robots.txt and sitemap.xml are
# generated during the build and must name the public host. It is passed at
# build time rather than run time for that reason alone; nothing secret is.
ARG APP_BASE_URL=https://easy-scraping.com
ARG SEO_INDEXING_ENABLED=true
ARG ADS_ENABLED=true
ARG ADSENSE_PUBLISHER_ID=ca-pub-5220225531544323
ARG ADSENSE_HOME_SLOT=2118692561
ENV APP_BASE_URL=${APP_BASE_URL} SEO_INDEXING_ENABLED=${SEO_INDEXING_ENABLED} ADS_ENABLED=${ADS_ENABLED} ADSENSE_PUBLISHER_ID=${ADSENSE_PUBLISHER_ID} ADSENSE_HOME_SLOT=${ADSENSE_HOME_SLOT}
RUN pnpm --filter @moneyverse/contract build && pnpm --filter @moneyverse/frontend build

FROM node:20.19.2-alpine
WORKDIR /app
ENV NODE_ENV=production

# The standalone output carries only the files the server actually reaches,
# with its own minimal node_modules — so the runtime image needs neither pnpm
# nor the workspace store.
COPY --from=build /repo/frontend/.next/standalone ./
COPY --from=build /repo/frontend/.next/static ./frontend/.next/static
# `output: 'standalone'` traces the server and generated assets, but it does
# not copy `public/`.  Keep root verification files such as ads.txt in the
# runtime image; serving them at the public origin is part of their contract.
COPY --from=build /repo/frontend/public ./frontend/public

RUN addgroup -S moneyverse && adduser -S moneyverse -G moneyverse
# The ISR cache is written at runtime, under .next/cache, by this user. The
# COPY above lands as root, so without this every revalidation fails with
# EACCES and the page is re-rendered from scratch on every request -- which
# is the whole benefit of ISR, lost silently in a log line.
RUN mkdir -p frontend/.next/cache \
 && chown -R moneyverse:moneyverse frontend/.next
USER moneyverse

EXPOSE 3000
ENV HOSTNAME=0.0.0.0 PORT=3000
CMD ["node", "frontend/server.js"]
