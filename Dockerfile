# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS build

WORKDIR /app

# Install dependencies first (layer cached unless package.json changes)
COPY package*.json ./
RUN npm ci

# Copy source and build Angular SSR
COPY . .
RUN npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

# Copy only the build output and production node_modules
COPY --from=build /app/dist ./dist

ENV PORT=4000

EXPOSE 4000

# Start the Angular SSR Express server
CMD ["node", "dist/frontend/server/server.mjs"]

