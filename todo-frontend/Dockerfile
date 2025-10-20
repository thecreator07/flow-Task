# Stage 1: Dependency Installation (using a lightweight Node base)
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ------------------------------------------------------------------

# Stage 2: Build the Next.js application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies and source files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the app (make sure your "build" script is "next build")
RUN npm run build

# ------------------------------------------------------------------

# Stage 3: Production/Runner Image (minimal and secure)
FROM node:22-alpine AS runner
WORKDIR /app

# Set production environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output and static files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Run the app as the non-root 'nextjs' user
USER nextjs

# Expose the default Next.js port
EXPOSE 3000

# Start the Next.js server (this uses the 'start' script defined by 'standalone' mode)
CMD ["node", "server.js"]