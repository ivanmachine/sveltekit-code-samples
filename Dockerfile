# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

# Copy the whole repo first so Yarn can generate a consistent PnP map + cache.
COPY . .
RUN yarn install --immutable
RUN yarn build

# Serve stage (Yarn PnP; no node_modules)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

# Copy the built app + Yarn PnP artifacts from the build stage.
COPY --from=build /app /app

EXPOSE 3000
CMD ["node", "--require", "./.pnp.cjs", "build/index.js"]

