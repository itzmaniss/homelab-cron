FROM oven/bun:1-slim

WORKDIR /app

COPY bun.lock ./
COPY tsconfig.json ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "--bun", "run", "cron.ts"]
