# Stage 1: Build Angular application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist/iwarecibos-web/browser/ /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 700

CMD ["nginx", "-g", "daemon off;"]
