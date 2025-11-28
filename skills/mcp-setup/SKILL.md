---
name: mcp-setup
description: MCP (Model Context Protocol) server setup for Claude Code and Cursor. Use when configuring AI tool integrations, database connections, or GitHub automation.
---

# MCP Server Setup

Configuration for MCP servers used by both Claude Code and Cursor in the GM-TC project.

## Configured Servers

| Server | Purpose | Status |
|--------|---------|--------|
| **github** | PR reviews, issues, repo management | Ready to authenticate |
| **postgres** | Direct database queries | Disabled until DB is set up |

## Setup Instructions

### For Claude Code

#### 1. Add GitHub MCP (run in terminal)
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ --scope project
```

#### 2. Authenticate GitHub
In Claude Code, run:
```
/mcp
```
Select "Authenticate" for GitHub when prompted.

#### 3. Enable PostgreSQL (when database is ready)
```bash
# Set your database URL
export GMTC_DATABASE_URL="postgresql://user:pass@localhost:5432/gmtc"

# Add the MCP server
claude mcp add --transport stdio postgres -- npx -y @bytebase/dbhub --dsn "$GMTC_DATABASE_URL"
```

### For Cursor

#### 1. GitHub MCP
The `.cursor/mcp.json` file is already configured. To authenticate:
1. Open Cursor Settings (Ctrl+,)
2. Search for "MCP"
3. Find GitHub and click "Authenticate"

#### 2. PostgreSQL MCP
1. Create a `.env` file in project root:
   ```
   GMTC_DATABASE_URL=postgresql://user:pass@localhost:5432/gmtc
   ```
2. Edit `.cursor/mcp.json` and set `"disabled": false` for postgres

## MCP Commands Reference

### Claude Code
```bash
# List all MCP servers
claude mcp list

# Get server details
claude mcp get github

# Remove a server
claude mcp remove github

# Check status (in Claude Code)
/mcp
```

### Cursor
- Settings > MCP Servers
- Or use Command Palette: "MCP: List Servers"

## Usage Examples

### GitHub MCP
Once authenticated, use natural language:
- "Create an issue for the login bug we discussed"
- "Review PR #15 and suggest improvements"
- "Show me all open issues labeled 'bug'"
- "Create a PR from this branch to main"

### PostgreSQL MCP
Once enabled, query your database naturally:
- "Show me all customers who ordered in the last 30 days"
- "What's our total revenue this month?"
- "List the parts with low stock"
- "Show the schema for the orders table"

## Configuration Files

### Claude Code: `.mcp.json` (project root)
```json
{
  "mcpServers": {
    "github": {
      "transport": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

### Cursor: `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

## Security Notes

- Never commit database credentials to git
- Use environment variables for sensitive data
- The `.env` file is in `.gitignore`
- MCP authentication tokens are stored locally, not in the repo

## Troubleshooting

### "MCP server not responding"
```bash
# Check if npx can run the server
npx -y @bytebase/dbhub --help
```

### "Authentication failed" for GitHub
1. Ensure you're logged into GitHub in your browser
2. Try re-authenticating via `/mcp` or Cursor settings
3. Check if your GitHub token has required permissions

### PostgreSQL connection issues
```bash
# Test connection manually
psql "$GMTC_DATABASE_URL" -c "SELECT 1"
```

## Additional MCP Servers

Other useful MCPs you might add later:

| Server | Package | Use Case |
|--------|---------|----------|
| Filesystem | `@anthropic/mcp-server-filesystem` | Enhanced file operations |
| Fetch | `@anthropic/mcp-server-fetch` | Web requests and API testing |
| Memory | `@anthropic/mcp-server-memory` | Persistent context across sessions |
