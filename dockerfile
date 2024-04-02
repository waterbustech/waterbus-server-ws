FROM node:18.16.0-alpine as build

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 100000

COPY --chown=node:node . .

RUN yarn build

FROM node:18.16.0-alpine as development

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

ENV NODE_ENV=development

CMD [ "node", "dist/src/main.js" ]
