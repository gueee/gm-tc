# Quick Start: SSH Access to GM-TC Uberspace

## Current Status

✓ SSH key pair generated
- **Location**: `~/.ssh/gmtc_uberspace` (private) and `~/.ssh/gmtc_uberspace.pub` (public)
- **Type**: ED25519 (secure, modern)
- **Fingerprint**: `SHA256:TANlskihbcNDciQzEmeBK71UdknqA409EU7SuDG/ijU`

⚠ **Action Required**: Install the SSH key to the server

## Quick Installation (Recommended)

Run the automated installation script:

```bash
./install_ssh_key.sh
```

This script will:
1. Verify the SSH key exists
2. Copy it to the server (requires your Uberspace password)
3. Test the connection
4. Provide next steps

After installation, set up SSH config for easy access:

```bash
./setup_ssh_config.sh
```

Then connect with just:
```bash
ssh gmtc
```

## Manual Installation

If the automated script doesn't work, follow these steps:

### Step 1: Copy Your Public Key

Your public key is:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFOH4WYNFFjZOx9cKoc1HvFyDZDFCaxkPvJFld7OwpuB gmtc@gm-tc.tech
```

### Step 2: SSH to Server with Password

```bash
ssh gmtc@gmtc.uber.space
```

### Step 3: Add Key to Server

Once logged in, run:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFOH4WYNFFjZOx9cKoc1HvFyDZDFCaxkPvJFld7OwpuB gmtc@gm-tc.tech" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### Step 4: Test Connection

```bash
ssh -i ~/.ssh/gmtc_uberspace gmtc@gmtc.uber.space
```

If successful, you should connect without a password!

## What's Next?

After SSH access is working:

1. **Set up SSH config** (optional but recommended):
   ```bash
   ./setup_ssh_config.sh
   ```

2. **Follow the deployment guide**: See [DEPLOYMENT.md](DEPLOYMENT.md) for:
   - Server setup and configuration
   - Database creation
   - Application deployment
   - File upload methods
   - Service management

3. **Initial server setup**:
   ```bash
   ssh gmtc
   cd ~
   mkdir -p gmtc-crm backups logs
   ```

## Troubleshooting

### "Permission denied (publickey)"

The key isn't installed yet. Run `./install_ssh_key.sh` or follow manual installation.

### "Too many authentication failures"

SSH is trying too many keys. Use:
```bash
ssh -i ~/.ssh/gmtc_uberspace -o IdentitiesOnly=yes gmtc@gmtc.uber.space
```

### "Connection timeout"

Check network connectivity:
```bash
ping gmtc.uber.space
```

## Files in This Repository

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with all server commands
- **[SSH_SETUP.md](SSH_SETUP.md)** - Detailed SSH key setup instructions
- **[install_ssh_key.sh](install_ssh_key.sh)** - Automated SSH key installation
- **[setup_ssh_config.sh](setup_ssh_config.sh)** - Automated SSH config setup
- **README_SSH.md** - This quick start guide

## Server Information

- **Server**: gmtc.uber.space
- **Domain**: gm-tc.tech
- **User**: gmtc
- **SSH**: `ssh gmtc@gmtc.uber.space`

---

**Need Help?** See [SSH_SETUP.md](SSH_SETUP.md) for detailed instructions and troubleshooting.
