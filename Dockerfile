FROM oven/bun:1-alpine

ENV TZ="Asia/Kathmandu"

# Install Python 3, pip, and build tools
RUN apk add --no-cache python3 py3-pip python3-dev build-base

WORKDIR /app

# Install Python requirements
COPY app/requirements.txt ./app/
RUN pip install --no-cache-dir --break-system-packages -r app/requirements.txt

# Install customer page dependencies
COPY "customer page/package.json" "customer page/bun.lock" "customer page/bunfig.toml" "./customer page/"
RUN cd "customer page" && bun install --frozen-lockfile

# Install recruiter view dependencies
COPY "recruiter view/package.json" "recruiter view/bun.lock" "recruiter view/bunfig.toml" "./recruiter view/"
RUN cd "recruiter view" && bun install --frozen-lockfile

# Copy the entire workspace
COPY . .

# Convert start.sh line endings to LF and set executable permissions
RUN tr -d '\r' < scripts/start.sh > scripts/start_lf.sh && \
    mv scripts/start_lf.sh scripts/start.sh && \
    chmod +x scripts/start.sh

# Expose ports: 8000 (API), 3000 (customer), 3001 (recruiter)
EXPOSE 8000 3000 3001

CMD ["./scripts/start.sh"]
