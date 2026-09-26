# CMS (Payload admin + API). Build from the repository root:
#   docker build -f apps/cms/Dockerfile -t digio-cms .
# Runtime configuration comes from environment variables (see apps/cms/.env.example).

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/cms/package.json apps/cms/
COPY packages/payload-types/package.json packages/payload-types/
RUN pnpm install --frozen-lockfile --filter cms...

FROM base AS builder
# Inlined into the admin bundle at build time.
ARG NEXT_PUBLIC_WEB_URL=http://localhost:3000
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL
COPY --from=deps /repo ./
COPY packages packages
COPY apps/cms apps/cms
RUN pnpm --filter cms build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /repo/apps/cms/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/cms/.next/static ./apps/cms/.next/static
USER nextjs
EXPOSE 3001
CMD ["node", "apps/cms/server.js"]
