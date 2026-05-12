FROM oven/bun:1-alpine

WORKDIR /app

# copy migration ให้ตรง relative path ที่ config.ts อ้างถึง
COPY app/database ./database
COPY app/backend/package.json app/backend/bun.lock ./backend/

WORKDIR /app/backend
RUN bun install --frozen-lockfile

COPY app/backend .

EXPOSE 8000
CMD ["bun", "src/index.ts"]