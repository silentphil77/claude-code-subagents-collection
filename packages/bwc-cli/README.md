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
# Initialize configuration
bwc init

# Add a subagent
bwc add --agent python-pro

# Add a command
bwc add --command dockerize

# Browse and select interactively
bwc add
```

## Commands

### `bwc init`

Initialize bwc configuration.

```bash
# Initialize global configuration (default)
bwc init

# Initialize project-level configuration
bwc init --project
```

Options:
- `-p, --project` - Create project-level configuration
- `-f, --force` - Overwrite existing configuration

### `bwc add`

Add subagents or commands to your Claude Code setup.

```bash
# Add a specific subagent
bwc add --agent python-pro

# Add a specific command
bwc add --command dockerize

# Interactive mode (browse and select multiple items)
bwc add
```

Options:
- `-a, --agent <name>` - Add a specific subagent
- `-c, --command <name>` - Add a specific command

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
- Global configuration (`~/.bwc/config.json`) otherwise

## Configuration

### Global Configuration

Located at `~/.bwc/config.json`:

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

## Use Cases

### Team Onboarding

Share your Claude Code setup with your team:

```bash
# Initialize project configuration
bwc init --project

# Add project-specific subagents
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

## MCP Servers

### Adding MCP Servers

BWC CLI supports Model Context Protocol (MCP) servers:

```bash
# Add an MCP server
bwc add --mcp filesystem

# List available MCP servers
bwc list --mcp
```


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