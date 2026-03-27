# --- Build stage ---
FROM node:20-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production=false
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Production stage: Apify Playwright Chrome (Chromium pre-installed, OOM-safe) ---
FROM apify/actor-node-playwright-chrome:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Copy standalone Next.js build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install only production deps (playwright-core needs no browser download)
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts && \
    rm -rf /tmp/* /root/.npm /root/.cache

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

USER myuser

CMD ["node", "server.js"]
