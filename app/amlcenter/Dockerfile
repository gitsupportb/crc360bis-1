# AML Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and build dependencies for Python packages
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    g++ \
    make \
    linux-headers

# Copy package files
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --break-system-packages -r requirements.txt

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variable for port
ENV PORT=5000

# Start the application
CMD ["node", "server.js"]
