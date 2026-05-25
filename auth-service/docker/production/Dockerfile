# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.19.5

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /home/node/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

COPY . .

RUN npm run build


FROM node:${NODE_VERSION}-alpine AS production

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

ENV NODE_ENV=production

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

COPY --from=builder --chown=node:node /home/node/app/dist ./
COPY --from=builder --chown=node:node /home/node/app/certs ./certs

EXPOSE 3000

CMD ["node", "src/server.js"]
