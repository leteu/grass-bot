## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY tsconfig.json .

# Build project
RUN npm run build

## producation runner
FROM node:lts-alpine as prod-runner

ARG BOT_TOKEN
ENV BOT_TOKEN ${BOT_TOKEN}
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN ${GITHUB_TOKEN}

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json
COPY --from=build-runner /tmp/app/package-lock.json /app/package-lock.json

# Install dependencies
RUN npm install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/src/assets/MesloLGS-NF-Regular.woff2 /app/users

# Start bot
CMD BOT_TOKEN=${BOT_TOKEN} GITHUB_TOKEN=${GITHUB_TOKEN} npm run serve
