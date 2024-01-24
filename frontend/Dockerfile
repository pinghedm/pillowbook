FROM node:20-alpine as base
    WORKDIR /app
    COPY ["package.json", "package-lock.json", "./"]
    RUN npm ci



FROM base as prod
    COPY . .
