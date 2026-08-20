# ============ FRONTEND ============

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
RUN npm prune --production

FROM node:20-alpine AS frontend-development
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS frontend-production
WORKDIR /app
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/package-lock.json ./
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/next.config.ts ./
COPY --from=frontend-builder /app/public ./public
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
