FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3000

# Run in production mode
CMD ["npm", "start"]
