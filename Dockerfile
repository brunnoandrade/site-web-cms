# Site V2 Digio: a single image with the public website and the CMS (Payload, at /admin).
# Build from the repository root, with Podman or Docker:
#   podman build -t digio-site .
#   podman build --build-arg NEXT_PUBLIC_MEDIA_URL=https://cdn.example.com/digio-media -t digio-site .
# Runtime configuration comes from environment variables (see .env.example).
#
# Kept compatible with Podman: fully qualified base image (no short-name prompt), no
# BuildKit-only syntax, numeric non-root user. The build does not need the database: pages are
# rendered on the first request and cached (ISR), then refreshed by the revalidation webhook.

ARG NODE_IMAGE=docker.io/library/node:24-alpine

FROM ${NODE_IMAGE} AS base
RUN apk add --no-cache libc6-compat
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS builder
# NEXT_PUBLIC_* values and the image host allowlist are fixed at build time,
# so each environment (DEV/HML/PRD) builds its own image with its own values.
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3000
ARG NEXT_PUBLIC_WEB_URL=http://localhost:3000
ARG NEXT_PUBLIC_MEDIA_URL=http://localhost:9200/digio-media
ARG IMAGES_ALLOW_LOCAL_IP=false
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL \
    NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL \
    NEXT_PUBLIC_MEDIA_URL=$NEXT_PUBLIC_MEDIA_URL \
    IMAGES_ALLOW_LOCAL_IP=$IMAGES_ALLOW_LOCAL_IP \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=1001:1001 /repo/.next/standalone ./
COPY --from=builder --chown=1001:1001 /repo/.next/static ./.next/static
COPY --from=builder --chown=1001:1001 /repo/public ./public
USER 1001
EXPOSE 3000
CMD ["node", "server.js"]
