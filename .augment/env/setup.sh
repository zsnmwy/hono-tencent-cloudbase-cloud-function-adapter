#!/bin/bash
set -e

# Update system packages
sudo apt-get update

# Install Node.js (latest LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally with sudo
sudo npm install -g pnpm@9.12.3

# Verify installations
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "pnpm version: $(pnpm --version)"

# Install project dependencies
pnpm install

echo "Development environment setup completed successfully!"