#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y \
    nginx \
    certbot \
    python3-certbot-nginx \
    python3-pip \
    python3-venv \
    git \
    curl

# Install uv (fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create app directories
mkdir -p /var/www/therapyai
mkdir -p /opt/therapyai

# Set permissions
chown -R www-data:www-data /var/www/therapyai

echo "Startup script completed!"
