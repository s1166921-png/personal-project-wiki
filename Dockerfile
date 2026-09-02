# syntax=docker/dockerfile:1

# ── 构建阶段：安装 VitePress 并生成静态站 ──
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run docs:build

# ── 运行阶段：nginx 托管静态产物 ──
FROM nginx:1.27-alpine AS serve
COPY --from=build /app/site/docs/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1
