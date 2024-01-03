## build runner
FROM node:18 as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

RUN npm i -g pnpm

# Install dependencies
RUN pnpm install

# Move source files
COPY src ./src
COPY tsconfig.json .

# Build project
RUN pnpm run build

## producation runner
FROM node:18 as prod-runner

ARG BOT_TOKEN
ENV BOT_TOKEN ${BOT_TOKEN}
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN ${GITHUB_TOKEN}

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json
COPY --from=build-runner /tmp/app/package-lock.json /app/package-lock.json

RUN npm i -g pnpm

# Install dependencies
RUN pnpm install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build

# Start bot
CMD BOT_TOKEN=${BOT_TOKEN} GITHUB_TOKEN=${GITHUB_TOKEN} pnpm run serve
