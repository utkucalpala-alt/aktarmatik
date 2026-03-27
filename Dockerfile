# Use the official Apify image for Playwright as the base
# This image includes Node.js, Playwright dependencies, and Chromium.
FROM apify/actor-node-playwright-chrome:30 AS base

# --- Dependencies ---
# We use a separate stage for installing dependencies to take advantage of Docker layering.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Skip browser download as it's already in the base image
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
# Install only production dependencies for smaller image and lower RAM usage
RUN npm ci --only=production

# --- Builder ---
# In this stage, we build the Next.js application.
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner ---
# The final image that will run on Dokploy.
FROM apify/actor-node-playwright-chrome:30 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Important for RAM optimization on Dokploy/limited environments
ENV NODE_OPTIONS="--max-old-space-size=1536"
# Chromium needs these to run correctly in Docker
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CRAWLEE_HEADLESS=1

# Use the non-privileged user provided by the Apify image (usually 'apify' or 'node')
# However, the project previously used 'nextjs'. Let's ensure compatibility.
# The 'apify' image usually runs as 'myuser' or 'apify' or 'node'.
# Let's check the base image's default user or just use 'apify' which is standard for this image.

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Note: In 'standalone' mode, Next.js copies necessary node_modules into the standalone folder.
# We just need to make sure the app starts correctly.

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Running as 'myuser' (default in apify image) to avoid permission issues with Chromium
USER myuser

CMD ["node", "server.js"]
