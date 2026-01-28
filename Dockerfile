# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs ./
RUN yarn install --immutable
COPY . .
RUN yarn build

# Serve stage (Yarn PnP; no node_modules)
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY package.json yarn.lock .pnp.cjs .pnp.loader.mjs ./
RUN yarn install --immutable

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "--require", "./.pnp.cjs", "build/index.js"]

