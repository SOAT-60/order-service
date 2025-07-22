# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache wget

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"] 