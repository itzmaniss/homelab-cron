FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "--bun", "run", "cron.ts"]
