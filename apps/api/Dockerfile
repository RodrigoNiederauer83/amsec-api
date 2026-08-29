FROM node:22-alpine

WORKDIR /app

COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm install

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/api
RUN npx prisma generate

WORKDIR /app
RUN npx turbo run build --filter=backend

WORKDIR /app/apps/api
EXPOSE 3333

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]