# --- Stage 1: Build the React App ---
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# IMPORTANT: Copy the .env file so Vite can see the addresses during build
COPY .env .env

# Build for production (creates the /dist folder)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (to listen on port 3000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]