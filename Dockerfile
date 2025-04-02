FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
COPY package*.json ./
RUN pnpm install

# Copy source code
COPY . .

# Debug: List files and verify node_modules
RUN ls -la && ls -la node_modules/

EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"] 