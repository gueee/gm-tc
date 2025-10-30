#!/bin/bash
# setup_ssh_config.sh - Set up SSH config for GM-TC Uberspace server

set -e

echo "========================================="
echo "GM-TC SSH Config Setup"
echo "========================================="
echo ""

CONFIG_FILE=~/.ssh/config
BACKUP_FILE=~/.ssh/config.backup.$(date +%Y%m%d_%H%M%S)

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Backup existing config if it exists
if [ -f "$CONFIG_FILE" ]; then
    echo "Backing up existing SSH config to:"
    echo "  $BACKUP_FILE"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo ""
fi

# Check if entry already exists
if grep -q "Host gmtc" "$CONFIG_FILE" 2>/dev/null; then
    echo "⚠ SSH config entry for 'gmtc' already exists."
    echo ""
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. No changes made."
        exit 0
    fi

    # Remove existing entry
    sed -i '/^# GM-TC Uberspace Server$/,/^$/d' "$CONFIG_FILE"
    sed -i '/^Host gmtc$/,/^$/d' "$CONFIG_FILE"
    sed -i '/^Host gmtc\.uber\.space$/,/^$/d' "$CONFIG_FILE"
fi

# Add SSH config entry
cat >> "$CONFIG_FILE" << 'EOF'

# GM-TC Uberspace Server
Host gmtc
    HostName gmtc.uber.space
    User gmtc
    IdentityFile ~/.ssh/gmtc_uberspace
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Alias for full hostname
Host gmtc.uber.space
    User gmtc
    IdentityFile ~/.ssh/gmtc_uberspace
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
EOF

# Set proper permissions
chmod 600 "$CONFIG_FILE"

echo "========================================="
echo "SSH config updated successfully!"
echo "========================================="
echo ""
echo "Added entries:"
echo "  - Host gmtc (shorthand)"
echo "  - Host gmtc.uber.space (full hostname)"
echo ""
echo "You can now connect using any of these methods:"
echo ""
echo "  1. ssh gmtc"
echo "  2. ssh gmtc.uber.space"
echo "  3. ssh gmtc@gmtc.uber.space"
echo ""
echo "Testing connection..."
echo ""

if ssh -o ConnectTimeout=5 gmtc "echo 'Connection successful!'" 2>/dev/null; then
    echo "✓ Connection test passed!"
    echo ""
    echo "You're all set! Try it:"
    echo "  ssh gmtc"
else
    echo "⚠ Connection test failed."
    echo ""
    echo "Make sure you've installed the SSH key first:"
    echo "  ./install_ssh_key.sh"
    echo ""
    echo "Or test manually:"
    echo "  ssh gmtc"
fi
