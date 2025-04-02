FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Debug: List files and verify node_modules
RUN ls -la && ls -la node_modules/

EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"] 