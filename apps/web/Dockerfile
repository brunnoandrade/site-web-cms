# Public website. Build from the repository root:
#   docker build -f apps/web/Dockerfile -t digio-web .
# The build does not need the CMS: pages are rendered on the first request and cached (ISR),
# then refreshed by the CMS revalidation webhook. Server-side configuration comes from
# environment variables (see apps/web/.env.example).

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
# npm ci validates the lockfile against every workspace manifest, so all of them are needed.
COPY apps/cms/package.json apps/cms/
COPY apps/web/package.json apps/web/
COPY packages/payload-types/package.json packages/payload-types/
COPY packages/routes/package.json packages/routes/
RUN npm ci -w web

FROM base AS builder
# NEXT_PUBLIC_* values and the image host allowlist are fixed at build time,
# so each environment (DEV/HML/PRD) builds its own image with its own values.
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3001
ARG NEXT_PUBLIC_MEDIA_URL=http://localhost:9000/digio-media
ARG IMAGES_ALLOW_LOCAL_IP=false
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL \
    NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL \
    IMAGES_ALLOW_LOCAL_IP=$IMAGES_ALLOW_LOCAL_IP \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /repo ./
COPY packages packages
COPY apps/web apps/web
RUN npm run build -w web

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
