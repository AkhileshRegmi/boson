FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Cache package dependencies
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Copy app source
COPY . .

# Expose dev/preview port
EXPOSE 3001

ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "3001"]
