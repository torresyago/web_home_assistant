# --- Etapa 1: build del frontend ---
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client ./
RUN npm run build

# --- Etapa 2: servidor de producción ---
FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

COPY server/package.json ./
RUN npm install --omit=dev

COPY server ./
COPY --from=client-build /app/server/public ./public

RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "src/index.js"]
