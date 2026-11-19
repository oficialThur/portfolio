# ============ FRONTEND (Vite + React) ============

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine AS frontend-development
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

FROM nginx:alpine AS frontend-production
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# ============ BACKEND (Express) ============

FROM node:20-alpine AS backend-development
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/ ./
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS backend-production
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./
ENV NODE_ENV=production
EXPOSE 4000
# O Prisma 7 gera o client em TypeScript (generated/prisma/*.ts), então o Node
# puro não resolve os imports. O tsx (dependência de produção) executa o app.js
# e resolve os módulos TS sem precisar de um passo extra de compilação.
CMD ["npm", "start"]
