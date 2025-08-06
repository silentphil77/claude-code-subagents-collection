# MCP Registry Importers

Internal maintenance scripts for fetching MCP servers from various registries and generating markdown files for the Claude Code Subagents Collection.

## Overview

These scripts are used to automatically import MCP server definitions from:
- GitHub (ModelContextProtocol official servers)
- Smithery.ai (Community and hosted servers)
- Docker Hub (Official MCP Docker images)
- MCPMarket (Coming soon)

The fetched servers are converted to our markdown format and stored in `/mcp-servers/auto-imported/`.

## Setup

1. Install dependencies:
```bash
cd scripts/mcp-importers
npm install
```

2. Configure API keys:
```bash
cp .env.example .env
# Edit .env and add your Smithery API key
```

## Usage

### Fetch from all registries:
```bash
npm run fetch:all
```

### Fetch from specific registry:
```bash
npm run fetch:github
npm run fetch:smithery
npm run fetch:docker
```

### Advanced options:
```bash
# Limit number of servers
node fetch-from-registries.js --registry smithery --limit 10

# Dry run (preview without writing)
node fetch-from-registries.js --registry all --dry-run

# Custom output directory
node fetch-from-registries.js --output ../../custom-output
```

## GitHub Actions

The fetch process runs automatically via GitHub Actions:
- **Schedule**: Daily at 2 AM UTC
- **Manual trigger**: Via Actions tab in GitHub
- **Output**: Creates PR with updates

To enable:
1. Add `SMITHERY_API_KEY` as repository secret
2. The workflow will run automatically

## Directory Structure

Generated files are organized by source:
```
/mcp-servers/auto-imported/
├── github/       # Official MCP servers from GitHub
├── smithery/     # Servers from Smithery.ai
├── docker/       # Docker Hub MCP images
└── mcpmarket/    # Future: MCPMarket servers
```

## After Fetching

After fetching new servers:

1. **Generate registry**:
```bash
cd ../../web-ui
npm run generate-registry
```

2. **Commit changes**:
```bash
git add mcp-servers/auto-imported
git commit -m "chore: update auto-imported MCP servers"
```

3. **Servers are now available**:
- In BWC CLI: `bwc add --mcp <server-name>`
- In Web UI: https://buildwithclaude.com/mcp-servers

## Adding New Registry Fetchers

To add support for a new registry:

1. Create fetcher in `registry-fetchers/new-registry.js`
2. Implement the fetcher class with `fetchServers()` method
3. Import and add to `fetchers` object in `fetch-from-registries.js`
4. Add npm script in `package.json`

## Notes

- These are internal maintenance scripts, not part of the public BWC CLI
- The BWC CLI is for end users to find and install servers from our curated registry
- API keys are only needed for these maintenance scripts, not for end users