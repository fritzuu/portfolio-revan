FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY src/data/portfolio.json ./src/data/portfolio.json
COPY server ./server
RUN mkdir -p /app/server/data && chown -R node:node /app
USER node
EXPOSE 3001
CMD ["node", "server/index.js"]
