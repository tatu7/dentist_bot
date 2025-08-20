# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache \
    bash \
    openssl \
    libssl3 \
    && npm install -g prisma

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .



# Build the application
RUN npm run build
# Copy environment variables
COPY .env .env

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]


