# UPDATES

All notable changes to the Claude Code Subagents & Commands Collection will be documented in this file.

## 2025-08-20

### Added
- **Corporate Proxy Support**: BWC CLI now automatically detects and uses HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables
- **Enterprise Network Compatibility**: Enhanced network connectivity for users behind corporate firewalls and proxy servers
- **Proxy Debug Logging**: Automatic detection and logging of proxy configuration for better troubleshooting
- **NO_PROXY Support**: Bypass proxy for specific domains using wildcard patterns (e.g., `*.internal.com`)
- **Comprehensive Testing**: Added 27 unit tests covering all proxy functionality scenarios

### Improved
- **Network Reliability**: Better handling of corporate network configurations and authentication
- **User Experience**: Clear proxy status messages and debugging information
- **Documentation**: Comprehensive proxy setup guide with troubleshooting tips

## 2025-08-19

### Added
- 138 new specialized commands across 15+ categories (total: 174 commands)
- 22 command categories (expanded from 7) for better organization:
  - `api-development` - REST/GraphQL API design and implementation
  - `automation-workflow` - CI/CD automation and GitHub Actions
  - `database-operations` - Schema design, migrations, optimization
  - `framework-svelte` - 16 Svelte-specific commands
  - `game-development` - Unity project setup
  - `integration-sync` - GitHub-Linear sync, cross-platform integration
  - `monitoring-observability` - Performance monitoring and logging
  - `performance-optimization` - Caching, CDN, bundle optimization
  - `project-setup` - Environment configuration and initialization
  - `security-audit` - Security hardening and dependency auditing
  - `simulation-modeling` - Business scenarios and decision trees
  - `team-collaboration` - Sprint planning, retrospectives, workload balancing
  - `typescript-migration` - TypeScript migration tools
  - `utilities-debugging` - Debug tools and code analysis
  - `workflow-orchestration` - Task orchestration and status tracking

## [1.2.1] - 2025-08-15

### Added
- Docker MCP flag (`--docker-mcp`) for BWC installation commands
- Support for both Docker and Remote MCP providers
- Enhanced MCP server configuration options

### Changed
- Updated BWC CLI command options for better clarity
- Improved MCP server installation workflow

### Fixed
- MCP server installation path issues
- Configuration file generation bugs

## [1.2.0] - 2025-08-15

### Added
- Full MCP (Model Context Protocol) server support
- 100+ Docker MCP servers from Docker Hub
- `bwc status` command for configuration health checks
- Project and user scope management
- Team configuration sharing via `.bwc.config.json`

### Changed
- Refactored CLI architecture for better extensibility
- Updated package structure to monorepo
- Enhanced command discovery and loading

### Fixed
- Windows path compatibility issues
- Configuration file permissions

## [1.1.0] - 2025-08-06

### Added
- BWC CLI initial release
- Web UI at buildwithclaude.com
- 40+ specialized AI subagents
- 30+ slash commands
- Interactive installation mode
- Search and filter capabilities

### Changed
- Migrated from manual installation to CLI-based workflow
- Restructured documentation for better accessibility

## [1.0.0] - 2025-08-05

### Added
- Initial release of Claude Code Subagents Collection
- Core subagent framework
- Basic command structure
- Installation documentation
- Contributing guidelines
