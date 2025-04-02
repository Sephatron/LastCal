FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Debug: List files to verify structure
RUN ls -la && ls -la src/

EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"] 