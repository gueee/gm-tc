#!/bin/bash
# install_ssh_key.sh - Install SSH key to GM-TC Uberspace server

set -e

echo "========================================="
echo "GM-TC Uberspace SSH Key Installation"
echo "========================================="
echo ""

# Check if key exists
if [ ! -f ~/.ssh/gmtc_uberspace.pub ]; then
    echo "ERROR: SSH key not found at ~/.ssh/gmtc_uberspace.pub"
    echo "Please generate the key first with:"
    echo "  ssh-keygen -t ed25519 -f ~/.ssh/gmtc_uberspace -C 'gmtc@gm-tc.tech'"
    exit 1
fi

echo "Found SSH public key:"
cat ~/.ssh/gmtc_uberspace.pub
echo ""

echo "Installing SSH key to gmtc@gmtc.uber.space..."
echo "You will be prompted for your Uberspace password."
echo ""

# Try to copy the key
if ssh-copy-id -i ~/.ssh/gmtc_uberspace.pub gmtc@gmtc.uber.space; then
    echo ""
    echo "========================================="
    echo "SSH key installed successfully!"
    echo "========================================="
    echo ""
    echo "Testing connection..."

    if ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space "echo 'Connection test successful!'" 2>/dev/null; then
        echo ""
        echo "✓ Connection verified!"
        echo ""
        echo "You can now connect with:"
        echo "  ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space"
        echo ""
        echo "Or add to ~/.ssh/config and use:"
        echo "  ssh gmtc"
        echo ""
        echo "Run this to set up SSH config:"
        echo "  ./setup_ssh_config.sh"
    else
        echo ""
        echo "⚠ Key installed but connection test failed."
        echo "Try connecting manually:"
        echo "  ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space"
    fi
else
    echo ""
    echo "========================================="
    echo "Automatic installation failed"
    echo "========================================="
    echo ""
    echo "Please try manual installation:"
    echo ""
    echo "1. SSH to the server with password:"
    echo "   ssh gmtc@gmtc.uber.space"
    echo ""
    echo "2. Run these commands on the server:"
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo ""
    echo "3. Add this key to authorized_keys:"
    cat ~/.ssh/gmtc_uberspace.pub
    echo ""
    echo "   echo \"$(cat ~/.ssh/gmtc_uberspace.pub)\" >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "4. Exit and test connection:"
    echo "   ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space"
    echo ""
    exit 1
fi
