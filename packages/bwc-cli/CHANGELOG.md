# bwc-cli

## 1.2.0

### Minor Changes

- **Add comprehensive MCP server support and enhance CLI functionality**

  ### New Features
  
  #### MCP Server Support
  - Added full support for 100+ Model Context Protocol servers via Docker MCP Gateway
  - `bwc mcp list` - List available MCP servers
  - `bwc mcp search` - Search for MCP servers by functionality
  - `bwc mcp info` - View detailed server information
  - `bwc mcp status` - Check Docker MCP Gateway status
  - `bwc add --mcp <server>` - Install MCP servers with user/project scope options
  - `bwc remove --mcp <server>` - Remove installed MCP servers

  #### Enhanced Commands
  - Added `bwc remove` command for uninstalling subagents, commands, and MCP servers
  - Added `bwc info` command for detailed information about items
  - Added `bwc contribute` command to help users contribute to the collection
  - Added `--user`/`--global` flags to `add` and `remove` commands for explicit user-level operations

  ### Bug Fixes
  - Fixed configuration scope behavior - project config now properly takes precedence when it exists
  - Fixed `--global` flag implementation that was defined but not working
  - Fixed documentation references to non-existent `.bwc/mcp-servers.json` file (MCP servers are actually stored in main config files)

  ### Documentation
  - Added comprehensive MCP server documentation
  - Updated CLI documentation with configuration scope behavior
  - Fixed terminology: "global" → "user" configuration throughout docs
  - Added examples for team collaboration with MCP servers

## 1.1.0

### Minor Changes

- # 🚀 MCP Server Support via Docker MCP Gateway

  ![MCP Servers](../buildwithclaude-mcps.png)

  Add Model Context Protocol (MCP) server support through secure Docker MCP Gateway integration with user and project scopes.

  ## New Features

  ### MCP Server Management (Docker Gateway Only)

  - **`bwc mcp list`** - Browse 100+ available MCP servers
  - **`bwc add --mcp <server>`** - Install servers via Docker MCP Gateway
  - **`bwc mcp search <query>`** - Find MCP servers by functionality
  - **`bwc mcp info <server>`** - View detailed server information
  - **`bwc mcp status`** - Check Docker MCP Gateway status

  ### Installation Scopes

  - **User Scope** (default) - Install for current user across all projects
  - **Project Scope** - Install for current project only (version controlled)

  ### Docker MCP Gateway Integration

  - ✅ Automatic Docker Desktop detection
  - ✅ Secure API key configuration
  - ✅ One-click server enablement
  - ✅ Unified gateway for all clients

  ## Why Docker MCP Gateway Only?

  We exclusively use Docker MCP Gateway for security:

  - 🔒 **Container Isolation** - Complete system protection
  - 🔑 **Secure Secrets** - Docker Desktop manages all API keys
  - 🌐 **Single Endpoint** - One gateway for all MCP servers
  - ✅ **Verified Images** - All servers are signed and verified

  ## Usage

  ```bash
  # Prerequisites: Install Docker Desktop
  # https://docker.com/products/docker-desktop

  # List available MCP servers
  bwc mcp list

  # Install for user (all projects)
  bwc add --mcp postgres

  # Install for project (team sharing)
  bwc add --mcp postgres --project

  # Configure with API key
  $ bwc add --mcp supabase
  ? Installation scope?
    ❯ User (all projects)
      Project (this project only)
  ? Enter your Supabase access token: ****
  ✓ Enabled in Docker MCP Gateway
  ```

  ## Installation Scopes Explained

  **User Scope** (stored in `~/.bwc/config.json`):

  - Servers available across all projects
  - Personal API keys stored securely
  - Not shared with team

  **Project Scope** (stored in `./bwc.config.json`):

  - Servers specific to project
  - Configuration in version control
  - Team members use same servers
  - API keys via environment variables

  ## Breaking Changes

  None - MCP support is additive and doesn't affect existing functionality.
