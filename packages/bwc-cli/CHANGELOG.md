# bwc-cli

## 1.2.2

### Patch Changes

- [#39](https://github.com/davepoon/claude-code-subagents-collection/pull/39) [`4cbf479`](https://github.com/davepoon/claude-code-subagents-collection/commit/4cbf4794bf62f075075864de53ca7b0782203dbb) Thanks [@davepoon](https://github.com/davepoon)! - Add corporate proxy support for enterprise networks

  - Added automatic support for HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables
  - Enhanced network connectivity for enterprise/corporate environments behind firewalls
  - Added comprehensive proxy detection and logging for better user experience
  - Improved debugging with automatic proxy configuration messages
  - Added comprehensive test coverage for proxy functionality

## 1.2.1

### Patch Changes

- Bug fixes and improvements for better user experience

  ### Bug Fixes

  - Added file existence checking with user confirmation prompts when installing agents/commands
  - Fixed duplicate shebang issue in built output that caused "Invalid or unexpected token" error
  - Fixed npm package warnings (corrected repository URL format and bin path)
  - Updated GitHub Actions workflow to support Personal Access Tokens for PR creation

  ### Improvements

  - Enhanced conflict resolution with clear overwrite/skip/abort options
  - Added informative descriptions to help users understand the consequences of each choice
  - Improved error handling and user guidance throughout the CLI

  ### Technical Changes

  - Removed duplicate banner configuration from tsup.config.ts
  - Fixed package.json bin path from "./dist/index.js" to "dist/index.js"
  - Updated repository URL to proper format "git+https://..."

## 1.2.0

### Minor Changes

- [#27](https://github.com/davepoon/claude-code-subagents-collection/pull/27) [`0d6deca`](https://github.com/davepoon/claude-code-subagents-collection/commit/0d6decae3f83626b0f246bbc7840a66b5b0dd4a5) Thanks [@davepoon](https://github.com/davepoon)! - Add comprehensive MCP server support and enhance CLI functionality

  ### New Features

  - **MCP Server Support**: Added full support for 100+ Model Context Protocol servers via Docker MCP Gateway

    - `bwc add --mcp <server>` - Install MCP servers (default: local scope)
    - `bwc add --mcp <server> --scope user` - Install globally for user
    - `bwc add --mcp <server> --scope project` - Install for current project
    - `bwc add --mcp <server> --scope local` - Install for local use only
    - `bwc remove --mcp <server>` - Remove installed MCP servers
    - `bwc remove --mcp <server> --scope user` - Remove from user scope
    - `bwc remove --mcp <server> --scope project` - Remove from project scope
    - `bwc remove --mcp <server> --scope local` - Remove from local scope
    - `bwc list --mcp` - List installed MCP servers
    - `bwc add --setup` - Setup Docker MCP Gateway independently
    - Interactive mode: `bwc add` now includes MCP server option with scope selection

  - **Enhanced Commands**:
    - Added `bwc remove` command for uninstalling subagents, commands, and MCP servers
    - Added `bwc info` command for detailed information about items
    - Added `--scope user|project|local` flags to MCP operations for configuration scope control

  ### Bug Fixes

  - Fixed configuration scope behavior - project config now properly takes precedence when it exists

  ### Documentation

  - Added comprehensive MCP server documentation
  - Updated CLI documentation with configuration scope behavior
  - Fixed terminology: "global" → "user" configuration throughout docs
  - Added examples for team collaboration with MCP servers

- [#27](https://github.com/davepoon/claude-code-subagents-collection/pull/27) [`e412e46`](https://github.com/davepoon/claude-code-subagents-collection/commit/e412e46e7c2ad15f2a4835f37d70a4e915dcb18b) Thanks [@davepoon](https://github.com/davepoon)! - Major enhancements to MCP server support and CLI functionality

  ### New Features

  - **`bwc status` command**: Added comprehensive configuration health checks

    - Basic status shows configuration scope and installed item counts
    - `--verify-mcp` flag performs deep verification of MCP server installations
    - `--json` flag provides machine-readable output for scripting
    - Provides intelligent fix commands with gateway setup reminders

  - **Remote MCP Server Support**: Added support for SSE/HTTP servers via Claude CLI

    - Connect to remote APIs and cloud services
    - Support for custom authentication headers
    - Proper .mcp.json integration for team sharing
    - `--transport sse/http --url <url>` for remote endpoints

  - **Enhanced .mcp.json Integration**: Improved team collaboration
    - SSE/HTTP servers properly saved with "type" field (not "transport")
    - Docker servers correctly excluded from .mcp.json (use gateway instead)
    - Project-scoped servers automatically shared via .mcp.json

  ### Improvements

  - Removed confusing Registry option from interactive mode
  - Added intelligent fix suggestions with gateway setup reminders
  - Improved MCP configuration consistency across all commands
  - Better error handling and user guidance for MCP server issues
  - Added converter utility for consistent BWC config to .mcp.json format conversion
  - Enhanced verification logic to detect and fix common configuration issues

  ### Bug Fixes

  - Fixed environment variables not being included in .mcp.json for SSE/HTTP servers
  - Fixed incorrect argument order for STDIO servers with environment variables

  ### Breaking Changes

  - None

  ### Documentation

  - Updated all documentation to reflect dual MCP provider support (Docker + Remote)
  - Added comprehensive troubleshooting guides
  - Clarified configuration scope behavior
  - Added MCP server verification documentation
  - Updated examples to show differences between server types

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
  - Added `--user` flag to `add` and `remove` commands for explicit user-level operations
  - Added `--project` flag to `add` and `remove` commands for explicit project-level operations

  ### Bug Fixes

  - Fixed configuration scope behavior - project config now properly takes precedence when it exists
  - Fixed scope flag implementation to properly handle user/project overrides
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
