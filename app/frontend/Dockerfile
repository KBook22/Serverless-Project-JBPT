FROM oven/bun:1-alpine AS builder

WORKDIR /app/frontend
COPY app/frontend/package.json app/frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY app/frontend .

# VITE_API_URL ต้องส่งตอน build เพราะ Vite bundle ค่าลงไปใน static files
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80