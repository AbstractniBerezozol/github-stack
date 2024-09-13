FROM node:18-alpine AS base

FROM base AS development
ARG APP
ARG NODE_ENV=development
ARG NODE_ENV=${APP}
WORKDIR /apps/${APP}
COPY package.json package-lock.json ./
RUN npm install
COPY  . . 
RUN npm run build ${APP}

