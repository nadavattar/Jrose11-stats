# Stage 1: Build the frontend
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Setup the backend and serve
FROM node:18-alpine
WORKDIR /app

# Copy package.json and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend code
COPY server ./server

# Copy built frontend assets from Stage 1
COPY --from=frontend-build /app/dist ./dist

# Create data directory
RUN mkdir -p server/data

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "server/index.cjs"]
