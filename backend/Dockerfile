# Start with an image that already has Node.js installed
FROM node:22-alpine

# Set the working folder inside the container
WORKDIR /app

# Copy dependency manifests first
COPY package*.json ./

# Install the app's dependencies
RUN npm ci --omit=dev

# Copy the backend code
COPY . .

# The backend listens on port 4000 by default
EXPOSE 4000

# Run the backend when the container starts
CMD ["npm", "start"]