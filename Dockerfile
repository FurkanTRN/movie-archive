FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

FROM deps AS build

WORKDIR /app

COPY . .

RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV TRUST_PROXY=true
ENV COOKIE_SECURE_AUTO=true

COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

RUN npm prune --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "run", "start:server"]
