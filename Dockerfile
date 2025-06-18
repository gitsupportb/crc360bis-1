# CRC360 - Comprehensive Risk and Compliance 360° Dashboard
# Multi-stage Docker build for optimized production image

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install system dependencies including Python and build tools
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    py3-pip \
    python3-dev \
    make \
    g++ \
    gcc \
    musl-dev \
    linux-headers

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Install Python dependencies for AML center
COPY app/amlcenter/requirements.txt ./app/amlcenter/
RUN pip3 install --no-cache-dir --break-system-packages -r app/amlcenter/requirements.txt

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run the integrated server
FROM base AS runner

# Install Python and required system packages for runtime
RUN apk add --no-cache \
    python3 \
    py3-pip \
    dumb-init

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy node_modules for the integrated server dependencies
COPY --from=deps /app/node_modules ./node_modules

# Install Python dependencies in the runtime image
COPY --from=deps /usr/lib/python3.*/site-packages /usr/lib/python3.*/site-packages

# Copy additional required files for the integrated server
COPY --from=builder /app/integrated-server.js ./
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/docsecureDOCS ./docsecureDOCS

# Create necessary directories
RUN mkdir -p uploads \
    app/amlcenter/uploads \
    docsecureDOCS/procedures \
    docsecureDOCS/modes_emploi \
    docsecureDOCS/notes_internes \
    docsecureDOCS/politiques \
    public/UPLOADED_REPORTINGS \
    logs

# Set the correct permissions
RUN chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

USER nextjs

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly and the integrated server
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "integrated-server.js"]
