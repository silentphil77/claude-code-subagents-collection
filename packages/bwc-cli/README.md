# bwc-cli - Build With Claude CLI

CLI tool for installing Claude Code subagents and commands from the community collection.

## Installation

```bash
# Global installation (recommended)
npm install -g bwc-cli

# Or use directly with npx
npx bwc-cli@latest init
```

## Quick Start

```bash
# Initialize user configuration (default)
bwc init

# Or initialize project configuration (team sharing)
bwc init --project

# Add a subagent (goes to project if project config exists)
bwc add --agent python-pro

# Add a command (goes to project if project config exists)
bwc add --command dockerize

# Browse and select interactively
bwc add
```

## Commands

### `bwc init`

Initialize bwc configuration.

```bash
# Initialize user configuration (default)
bwc init

# Initialize project-level configuration
bwc init --project
```

Options:
- `-p, --project` - Create project-level configuration
- `-f, --force` - Overwrite existing configuration

**Important**: When you initialize with `--project`, all subsequent `bwc add` commands will install to the project by default (`.claude/agents/` and `.claude/commands/`)

### `bwc add`

Add subagents or commands to your Claude Code setup.

```bash
# Add a specific subagent
bwc add --agent python-pro

# Add a specific command
bwc add --command dockerize

# Interactive mode (browse and select multiple items)
bwc add

# Force user-level installation even with project config
bwc add --agent python-pro --global
# Or use the --user flag (same effect)
bwc add --agent python-pro --user
```

Options:
- `-a, --agent <name>` - Add a specific subagent
- `-c, --command <name>` - Add a specific command
- `-g, --global` - Force user-level installation (when project config exists)
- `-u, --user` - Force user-level installation (alias for --global)

**Default Behavior**:
- If `./bwc.config.json` exists → installs to project (`.claude/agents/`, `.claude/commands/`)
- Otherwise → installs to user level (`~/.claude/agents/`, `~/.claude/commands/`)

**Interactive Mode Tips:**
- Use **SPACE** to select/deselect items
- Use **ENTER** to confirm and install selected items
- You can select multiple items at once

### `bwc list`

List available subagents and commands.

```bash
# List all items
bwc list

# List subagents only
bwc list --agents

# List commands only
bwc list --commands

# Filter by category
bwc list --category language-specialists

# Show only installed items
bwc list --installed
```

Options:
- `-a, --agents` - List subagents only
- `-c, --commands` - List commands only
- `--category <category>` - Filter by category
- `--installed` - Show only installed items

### `bwc search`

Search for subagents and commands.

```bash
# Search both subagents and commands
bwc search python

# Search subagents only
bwc search python --agents

# Search commands only
bwc search docker --commands
```

Options:
- `-a, --agents` - Search subagents only
- `-c, --commands` - Search commands only

### `bwc install`

Install all dependencies from configuration (perfect for team onboarding).

```bash
# Install all items listed in configuration
bwc install
```

This reads from either:
- Project configuration (`./bwc.config.json`) if it exists
- User configuration (`~/.bwc/config.json`) otherwise

### `bwc remove`

Remove installed subagents, commands, or MCP servers.

```bash
# Remove a specific subagent
bwc remove --agent python-pro

# Remove a specific command
bwc remove --command dockerize

# Remove an MCP server
bwc remove --mcp postgres

# Force user-level removal (when project config exists)
bwc remove --agent python-pro --global
bwc remove --agent python-pro --user    # Same as --global

# Skip confirmation prompt
bwc remove --agent python-pro --yes

# Interactive mode
bwc remove
```

Options:
- `-a, --agent <name>` - Remove a specific subagent
- `-c, --command <name>` - Remove a specific command
- `-m, --mcp <name>` - Remove a specific MCP server
- `-g, --global` - Force user-level removal (when project config exists)
- `-u, --user` - Force user-level removal (alias for --global)
- `-y, --yes` - Skip confirmation prompt

**Default Behavior**:
- If `./bwc.config.json` exists → removes from project
- Otherwise → removes from user level
- Use `--global` or `--user` to force user-level removal

## Configuration

### User Configuration

Located at `~/.bwc/config.json` (available across all your projects):

```json
{
  "version": "1.0",
  "registry": "https://buildwithclaude.com/registry.json",
  "paths": {
    "subagents": "~/.claude/agents/",
    "commands": "~/.claude/commands/"
  },
  "installed": {
    "subagents": ["python-pro", "react-wizard"],
    "commands": ["dockerize", "test-runner"]
  }
}
```

### Project Configuration

Located at `./bwc.config.json`:

```json
{
  "version": "1.0",
  "registry": "https://buildwithclaude.com/registry.json",
  "paths": {
    "subagents": ".claude/agents/",
    "commands": ".claude/commands/"
  },
  "installed": {
    "subagents": ["backend-architect", "database-admin"],
    "commands": ["api-tester", "dockerize"]
  }
}
```

**Note:** Add `.claude/` to your `.gitignore` to avoid committing installed files.

## Configuration Scope Behavior

When you initialize BWC with `bwc init --project`, it creates a project configuration that becomes the default for all installations:

```bash
# Initialize project configuration
bwc init --project

# These all install to PROJECT by default (./claude/agents/, ./claude/commands/)
bwc add --agent python-pro      # → ./claude/agents/python-pro.md
bwc add --command dockerize     # → ./claude/commands/dockerize.md

# MCP servers need explicit scope
bwc add --mcp postgres --scope project  # → ./bwc.config.json

# Override to install at user level
bwc add --agent golang-pro --global     # → ~/.claude/agents/golang-pro.md
bwc add --agent rust-pro --user         # → ~/.claude/agents/rust-pro.md (same as --global)
```

## Use Cases

### Team Onboarding

Share your Claude Code setup with your team:

```bash
# Initialize project configuration
bwc init --project

# Add project-specific subagents (automatically project-scoped)
bwc add --agent backend-architect
bwc add --agent database-admin
bwc add --command dockerize

# Commit configuration
git add bwc.config.json
git commit -m "Add Claude Code configuration"

# Team members install dependencies
git clone <repo>
bwc install
```

### Bulk Installation

Add multiple items at once:

```bash
# Search for testing-related tools
bwc search test

# Add multiple items interactively
bwc add
# Select "Subagent"
# Select category or "All"
# Use SPACE to select multiple items
# Press ENTER to install all
```

### CI/CD Integration

Automate Claude Code setup in your pipelines:

```yaml
# .github/workflows/setup.yml
- name: Install bwc CLI
  run: npm install -g bwc-cli
  
- name: Install Claude dependencies
  run: bwc install
```

## MCP Servers (Docker Gateway Only)

### 🔌 Connect Claude to External Tools

BWC CLI supports 100+ Model Context Protocol (MCP) servers through **secure Docker containers**. We exclusively use Docker MCP Gateway for maximum security.

### Prerequisites

**Docker Desktop Required**: Download from [docker.com/products/docker-desktop](https://docker.com/products/docker-desktop)

### Quick Start

```bash
# Browse available MCP servers
bwc mcp list

# Install for current user (all projects)
bwc add --mcp postgres

# Install for project only (team sharing)
bwc add --mcp postgres --project

# Search for specific functionality
bwc mcp search database

# View server details
bwc mcp info postgres
```

### Installation Scopes

#### User Scope
- **Location**: `~/.bwc/config.json` (under `installed.mcpServers`)
- **Availability**: All your projects
- **API Keys**: Personal, stored in Docker Desktop
- **Use Case**: Personal tools and services
- **Default when**: No project config exists

```bash
# Install for user (explicit)
bwc add --mcp supabase --scope user

# List user-installed servers
bwc mcp list --user
```

#### Project Scope
- **Location**: `./bwc.config.json` (under `installed.mcpServers`)
- **Availability**: Current project only
- **API Keys**: Via environment variables
- **Use Case**: Team collaboration
- **Default when**: Project config exists (requires explicit `--scope project` for MCP)

```bash
# Install for project (must be explicit for MCP)
bwc add --mcp postgres --scope project

# List project servers
bwc mcp list --project

# Commit configuration for team
git add bwc.config.json
git commit -m "Add MCP servers for team"
```

### Team Collaboration Example

```bash
# Team lead sets up project MCP servers
bwc init --project
bwc add --mcp postgres --project
bwc add --mcp github --project

# Commit configuration
git add bwc.config.json
git commit -m "Add team MCP servers"

# Team members clone and install
git clone <repo>
bwc install  # Installs all configured MCP servers
```

### Why Docker-Only?

- 🔒 **Container Isolation**: Complete system protection
- 🔑 **Secure Secrets**: Docker manages all API keys
- ✅ **Verified Images**: All servers signed by Docker
- 🌐 **Single Gateway**: One secure endpoint for all servers

### Available MCP Commands

```bash
# List all available servers
bwc mcp list

# Search for servers
bwc mcp search <query>

# View server information
bwc mcp info <server>

# Check Docker MCP Gateway status
bwc mcp status

# List by installation scope
bwc mcp list --user     # User-installed only
bwc mcp list --project  # Project-installed only
```

### Example: Adding Supabase

```bash
$ bwc add --mcp supabase
? Installation scope?
  ❯ User (all projects)
    Project (this project only)
? Enter your Supabase access token: ****
✓ Enabled supabase in Docker MCP Gateway
✓ Server available at docker://mcp-supabase
```

### Popular MCP Servers

- **postgres**: PostgreSQL database operations
- **github**: GitHub API integration
- **supabase**: Supabase backend services
- **stripe**: Payment processing
- **slack**: Team communication
- **notion**: Knowledge management
- **linear**: Issue tracking
- **elasticsearch**: Search and analytics

View all 100+ servers at [buildwithclaude.com/mcp-servers](https://buildwithclaude.com/mcp-servers)


## Categories

### Subagent Categories
- `development-architecture` - Backend, frontend, mobile, API design
- `language-specialists` - Language-specific expertise (Python, Go, Rust, etc.)
- `infrastructure-operations` - DevOps, cloud, deployment, databases
- `quality-security` - Code review, security, testing, performance
- `data-ai` - Data science, ML/AI engineering, analytics
- `specialized-domains` - Domain-specific tools (payments, blockchain, etc.)
- `crypto-trading` - Cryptocurrency and DeFi applications

### Command Categories
- `ci-deployment` - CI/CD and deployment commands
- `code-analysis-testing` - Code quality and testing commands
- `context-loading-priming` - Context and priming commands
- `documentation-changelogs` - Documentation commands
- `project-task-management` - Project management commands
- `version-control-git` - Git and version control commands
- `miscellaneous` - Other specialized commands

## Troubleshooting

### Configuration not found
Run `bwc init` to create configuration.

### Failed to fetch registry
Check your internet connection. The CLI needs access to `buildwithclaude.com`.

### Permission denied
On macOS/Linux, you may need to use `sudo npm install -g bwc-cli`.

### Interactive mode not selecting
Use **SPACE** to select items (not Enter). Selected items show a ● marker. Press **ENTER** only to confirm.

## Contributing

Visit [buildwithclaude.com/contribute](https://buildwithclaude.com/contribute) to add your own subagents and commands to the collection.

## Development

```bash
# Clone the repository
git clone https://github.com/davepoon/claude-code-subagents-collection.git
cd claude-code-subagents-collection/packages/bwc-cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Run in development mode
npm run dev

# Link for local testing
npm link
```

## Links

- **Website**: [buildwithclaude.com](https://buildwithclaude.com)
- **Documentation**: [buildwithclaude.com/docs/cli](https://buildwithclaude.com/docs/cli)
- **GitHub**: [github.com/davepoon/claude-code-subagents-collection](https://github.com/davepoon/claude-code-subagents-collection)
- **Issues**: [Report bugs or suggest features](https://github.com/davepoon/claude-code-subagents-collection/issues)

## License

MIT © Dave Poon