---
"bwc-cli": minor
---

Add comprehensive MCP server support and enhance CLI functionality

### New Features
- **MCP Server Support**: Added full support for 100+ Model Context Protocol servers via Docker MCP Gateway
  - `bwc mcp list` - List available MCP servers
  - `bwc mcp search` - Search for MCP servers by functionality
  - `bwc mcp info` - View detailed server information
  - `bwc mcp status` - Check Docker MCP Gateway status
  - `bwc add --mcp <server>` - Install MCP servers with user/project scope options
  - `bwc remove --mcp <server>` - Remove installed MCP servers

- **Enhanced Commands**:
  - Added `bwc remove` command for uninstalling subagents, commands, and MCP servers
  - Added `bwc info` command for detailed information about items
  - Added `bwc contribute` command to help users contribute to the collection
  - Added `--user`/`--global` flags to `add` and `remove` commands for explicit user-level operations

### Bug Fixes
- Fixed configuration scope behavior - project config now properly takes precedence when it exists

### Documentation
- Added comprehensive MCP server documentation
- Updated CLI documentation with configuration scope behavior
- Fixed terminology: "global" → "user" configuration throughout docs
- Added examples for team collaboration with MCP servers