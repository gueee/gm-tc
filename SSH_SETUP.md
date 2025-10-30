# SSH Key Setup for GM-TC Uberspace

## SSH Key Generated

An SSH key pair has been generated for secure access to the Uberspace server.

### Key Location
- **Private Key**: `~/.ssh/gmtc_uberspace`
- **Public Key**: `~/.ssh/gmtc_uberspace.pub`
- **Key Type**: ED25519 (modern, secure)
- **Key Fingerprint**: `SHA256:TANlskihbcNDciQzEmeBK71UdknqA409EU7SuDG/ijU`

## Manual SSH Key Installation

Since automatic installation requires a password, follow these steps to install the SSH key:

### Method 1: Using ssh-copy-id (Requires Password)

```bash
ssh-copy-id -i ~/.ssh/gmtc_uberspace.pub gmtc@gmtc.uber.space
```

When prompted, enter your Uberspace password. This will automatically add the public key to the server.

### Method 2: Manual Installation

If you prefer to install manually or don't have password access yet:

1. **Copy the public key** (already displayed below)
2. **SSH to the server** with your password:
   ```bash
   ssh gmtc@gmtc.uber.space
   ```
3. **Add the key** to authorized_keys:
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFOH4WYNFFjZOx9cKoc1HvFyDZDFCaxkPvJFld7OwpuB gmtc@gm-tc.tech" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
4. **Exit and test**:
   ```bash
   exit
   ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space
   ```

### Your Public Key

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFOH4WYNFFjZOx9cKoc1HvFyDZDFCaxkPvJFld7OwpuB gmtc@gm-tc.tech
```

## SSH Config Setup

To simplify SSH access, add this to your `~/.ssh/config` file:

```bash
# Edit SSH config
nano ~/.ssh/config
```

Add the following configuration:

```
Host gmtc
    HostName gmtc.uber.space
    User gmtc
    IdentityFile ~/.ssh/gmtc_uberspace
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

After adding this, you can connect with just:
```bash
ssh gmtc
```

## Testing the Connection

### Test 1: Basic Connection
```bash
ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space
```

### Test 2: With Config (after setting up ~/.ssh/config)
```bash
ssh gmtc
```

### Test 3: Run Remote Command
```bash
ssh gmtc@gmtc.uber.space "uberspace --version"
```

## Creating SSH Config

Run this command to automatically create the SSH config entry:

```bash
cat >> ~/.ssh/config << 'EOF'

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

chmod 600 ~/.ssh/config
```

## Quick Installation Script

For your convenience, here's a complete installation script:

```bash
#!/bin/bash
# install_ssh_key.sh

echo "Installing SSH key to gmtc.uber.space..."
echo ""
echo "You will be prompted for your Uberspace password."
echo ""

# Copy the key
ssh-copy-id -i ~/.ssh/gmtc_uberspace.pub gmtc@gmtc.uber.space

if [ $? -eq 0 ]; then
    echo ""
    echo "SSH key installed successfully!"
    echo ""
    echo "Testing connection..."
    ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space "echo 'Connection successful!'"

    if [ $? -eq 0 ]; then
        echo ""
        echo "All set! You can now connect with:"
        echo "  ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space"
        echo ""
        echo "Or set up SSH config and use:"
        echo "  ssh gmtc"
    fi
else
    echo ""
    echo "SSH key installation failed. Try manual installation method."
    echo "See SSH_SETUP.md for details."
fi
```

Save this script and run:
```bash
chmod +x install_ssh_key.sh
./install_ssh_key.sh
```

## Verification

After installation, verify the SSH key is working:

```bash
# Should connect without password
ssh gmtc@gmtc.uber.space

# Check authorized keys on server
ssh gmtc@gmtc.uber.space "cat ~/.ssh/authorized_keys"
```

## Security Notes

1. **Private Key Security**
   - Never share your private key (`~/.ssh/gmtc_uberspace`)
   - Keep permissions at 600: `chmod 600 ~/.ssh/gmtc_uberspace`
   - Back up securely (encrypted storage)

2. **Public Key**
   - Safe to share the public key (`.pub` file)
   - Can be added to multiple servers
   - Located at `~/.ssh/gmtc_uberspace.pub`

3. **Best Practices**
   - Use key-based authentication only (disable password auth if possible)
   - Rotate keys periodically
   - Use different keys for different servers
   - Enable two-factor authentication on Uberspace if available

## Troubleshooting

### Permission Denied (publickey)

```bash
# Check key permissions
ls -la ~/.ssh/gmtc_uberspace*

# Should show:
# -rw------- gmtc_uberspace (600)
# -rw-r--r-- gmtc_uberspace.pub (644)

# Fix if needed
chmod 600 ~/.ssh/gmtc_uberspace
chmod 644 ~/.ssh/gmtc_uberspace.pub
```

### Connection Timeout

```bash
# Test basic connectivity
ping gmtc.uber.space

# Test SSH port
nc -zv gmtc.uber.space 22
```

### Too Many Authentication Failures

This happens when SSH tries too many keys. Solutions:

1. Use `IdentitiesOnly yes` in SSH config
2. Specify key explicitly:
   ```bash
   ssh -i ~/.ssh/gmtc_uberspace -o IdentitiesOnly=yes gmtc@gmtc.uber.space
   ```

### Key Not Being Used

```bash
# Test with verbose output
ssh -v -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space

# Check which keys SSH is offering
ssh -vv gmtc@gmtc.uber.space 2>&1 | grep "Offering public key"
```

## Next Steps

After SSH key is installed:

1. Test the connection
2. Set up SSH config for easy access
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for server setup
4. Clone the repository to the server
5. Set up the application environment

## Reference

- **Server**: gmtc.uber.space
- **User**: gmtc
- **Domain**: gm-tc.tech
- **Private Key**: ~/.ssh/gmtc_uberspace
- **Public Key**: ~/.ssh/gmtc_uberspace.pub

---

**Created**: October 30, 2025
**Key Type**: ED25519
**Fingerprint**: SHA256:TANlskihbcNDciQzEmeBK71UdknqA409EU7SuDG/ijU
