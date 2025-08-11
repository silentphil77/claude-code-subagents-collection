---
"bwc-cli": minor
---

Add comprehensive MCP server support and enhance CLI functionality

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
  - Added `bwc contribute` command to help users contribute to the collection
  - Added `--scope user|project|local` flags to MCP operations for configuration scope control

### Bug Fixes
- Fixed configuration scope behavior - project config now properly takes precedence when it exists

### Documentation
- Added comprehensive MCP server documentation
- Updated CLI documentation with configuration scope behavior
- Fixed terminology: "global" → "user" configuration throughout docs
- Added examples for team collaboration with MCP servers