FROM node:20-slim AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Chromium and ALL required dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    dbus \
    fonts-noto-cjk \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libx11-xcb1 \
    libxcb1 \
    libxext6 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Tell Playwright to use system Chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
# Disable Chromium crash reporter
ENV CHROME_CRASHPAD_PIPE_NAME=
ENV CHROME_FLAGS="--no-sandbox --disable-crash-reporter"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary temp dirs with proper permissions
RUN mkdir -p /tmp/.chromium && chown nextjs:nodejs /tmp/.chromium

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build (includes traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy playwright-core into standalone node_modules (external package)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/playwright-core ./node_modules/playwright-core

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
