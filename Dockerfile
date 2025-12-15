# Use Node.js Alpine for small image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start the app
CMD ["npx", "next", "start", "-H", "192.168.0.94", "-p", "3000"]
