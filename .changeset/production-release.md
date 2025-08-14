---
"bwc-cli": minor
---

Major enhancements to MCP server support and CLI functionality

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

### Breaking Changes
- None

### Documentation
- Updated all documentation to reflect dual MCP provider support (Docker + Remote)
- Added comprehensive troubleshooting guides
- Clarified configuration scope behavior
- Added MCP server verification documentation
- Updated examples to show differences between server types