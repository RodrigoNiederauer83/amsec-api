FROM node:22-alpine

WORKDIR /app

COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm install

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app
ENV NODE_ENV=production
RUN npx turbo run build --filter=web

WORKDIR /app/apps/web
EXPOSE 3000

CMD ["sh", "-c", "npm run start"]