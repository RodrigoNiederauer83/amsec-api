FROM node:22-alpine

WORKDIR /app

COPY package*.json turbo.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm install

ENV NODE_ENV=production
RUN npx turbo run build --filter=web

EXPOSE 3000

CMD ["sh", "-c", "cd apps/web && npm run start"]