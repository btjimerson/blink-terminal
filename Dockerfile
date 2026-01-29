# Image node 20 bookworm
FROM node:20-bookworm

# Disable  interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 20.x (Current stable/LTS)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    gcc \
    libc6-dev\
    && rm -rf /var/lib/apt/lists/*

# Install network and utility tools
RUN apt-get update && apt-get install -y \
    net-tools \
    curl \
    dnsutils \
    telnet \
    iputils-ping \
    traceroute \
    ca-certificates \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# Set up application
WORKDIR /app
COPY package*.json ./
RUN npm install --build-from-source
RUN npm rebuild node-pty

# Sometimes node-pty looks in prebuilds directory and sometimes it loos in build directory, depending
# on OS / architecture. Let's make sure the rebuild module exists in both directories.
RUN mkdir -p /app/node_modules/node-pty/prebuilds/linux-arm64/ && \
    cp /app/node_modules/node-pty/build/Release/pty.node /app/node_modules/node-pty/prebuilds/linux-arm64/pty.node || true

# Copy compiled node modules and app files
COPY . .

# Set the right permissions
RUN chmod -R 755 /app

# Run node.js server on port 3000
EXPOSE 3000
CMD ["node", "server.js"]