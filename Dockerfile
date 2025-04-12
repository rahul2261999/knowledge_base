# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory
WORKDIR /app/rag

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Define a build-time argument
ARG RUN_MODE=dev

# Convert ARG to an ENV variable so it persists at runtime
ENV RUN_MODE=${RUN_MODE}

# Use the argument in the CMD instruction
CMD ["sh", "-c", "echo Running: npm run $RUN_MODE && npm run $RUN_MODE"]
