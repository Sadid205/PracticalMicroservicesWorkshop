# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --production

COPY --from=builder /usr/src/app/prisma ./prisma

RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 4005

CMD [ "node","dist/index.js" ]


