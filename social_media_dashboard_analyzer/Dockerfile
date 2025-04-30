# Base image
FROM node:14 AS build

# Set working directory
WORKDIR /app

# Copy dependencies file
COPY package*.json ./

# Debug: Show files
RUN ls -la /app

# Install dependencies
RUN npm install --verbose

# Copy application code
COPY . .

# Build the app (optional - for frameworks like Angular, React, etc.)
# RUN npm run build

# If your app is static (e.g. React), use nginx for production
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# Otherwise for Node.js backends
EXPOSE 5004
CMD ["npm", "start"]
