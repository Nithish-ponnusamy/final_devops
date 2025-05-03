# ---------- Stage 1: Build React App ----------
FROM node:18 AS build
WORKDIR /app

# Copy dependencies and install
COPY package*.json ./
RUN npm install

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# ---------- Stage 2: Serve with NGINX ----------
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Optional: copy custom NGINX config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
