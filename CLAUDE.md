# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Claude Code Subagents & Commands Collection repository, which contains:
- A collection of specialized AI subagents for Claude Code
- A library of slash commands for automation
- A web UI at buildwithclaude.com for browsing and installing
- A CLI tool (`bwc-cli`) for managing installations
- MCP (Model Context Protocol) server integration support

## Common Development Commands

### Building and Development

```bash
# Root level - validate and generate registry
npm run validate                  # Validate all subagents and commands
npm run generate:registry         # Generate registry.json for web UI

# Web UI development (in web-ui/)
npm run dev                      # Start Next.js dev server on localhost:3000
npm run build                    # Build production version
npm run lint                     # Run linting

# CLI tool development (in packages/bwc-cli/)
npm run build                    # Build the CLI tool
npm run dev                      # Watch mode for development
npm run typecheck               # Check TypeScript types
npm run lint                     # Lint the code
```

### Publishing and Releases

```bash
# Using changesets for version management
npm run changeset               # Create a new changeset
npm run version-packages        # Version packages based on changesets
npm run release                 # Publish packages to npm
```

### Testing the CLI locally

```bash
# In packages/bwc-cli/
npm run build
npm link                        # Link globally for testing
bwc --help                      # Test the CLI
```

## Architecture and Structure

### Repository Layout

- **`/subagents/`**: Markdown files defining AI subagents, each with frontmatter (name, description, category) and system prompt
- **`/commands/`**: Markdown files defining slash commands with configuration and implementation details
- **`/mcp-servers/`**: MCP server definitions with installation methods and configuration schemas
- **`/web-ui/`**: Next.js 15 application using App Router, shadcn/ui components, and Tailwind CSS
- **`/packages/bwc-cli/`**: TypeScript CLI tool built with Commander.js for installing subagents/commands
- **`/scripts/`**: Node.js scripts for validation and registry generation

### Key Architectural Patterns

1. **Registry System**: The `registry.json` file is auto-generated from markdown files and serves as the source of truth for the web UI and CLI. It includes metadata, file paths, and content hashes.

2. **Markdown-Driven Content**: All subagents, commands, and MCP servers are defined in markdown with YAML frontmatter, making them both human-readable and machine-parseable.

3. **Multi-Source MCP Support**: MCP servers can be installed from Docker, npm, GitHub, or other marketplaces, with the system determining the best installation method.

4. **Monorepo with Workspaces**: Uses npm workspaces to manage the CLI package and web UI together, with changesets for coordinated releases.

5. **Validation Pipeline**: JSON schemas validate the structure of subagents, commands, and MCP servers before they're included in the registry.

## Working with MCP Servers

The project is expanding to support MCP (Model Context Protocol) servers. Key files:
- `docs/mcp-implementation-plan.md`: Detailed implementation roadmap
- `scripts/mcp-server-schema.json`: Validation schema for MCP server definitions
- `packages/bwc-cli/src/utils/mcp-installer.ts`: MCP installation logic

When adding MCP support:
1. Follow the structure in `/mcp-servers/TEMPLATE.md`
2. Include multiple installation sources (Docker preferred for security)
3. Provide clear configuration examples
4. Add appropriate verification status

## Important Conventions

1. **File Naming**: Use lowercase, hyphen-separated names for all markdown files
2. **Categories**: Must match predefined categories (see `CONTRIBUTING.md`)
3. **Frontmatter Required Fields**:
   - Subagents: name, description, category
   - Commands: description, category
   - MCP Servers: name, description, category, server-type
4. **No Model/Tools in Frontmatter**: These are stripped during processing for flexibility

## Working with the Web UI

The web UI uses:
- Next.js 15 with App Router
- Server Components by default, Client Components marked with 'use client'
- shadcn/ui components in `/components/ui/`
- Dynamic routes for individual subagent/command pages
- Static generation where possible for performance

## CLI Tool Architecture

The CLI (`bwc`) provides commands for:
- `init`: Initialize configuration
- `add`: Add subagents, commands, or MCP servers
- `list`: List available items
- `search`: Search the registry
- `mcp`: MCP-specific operations

Configuration is stored in either:
- Global: `~/.bwc/config.json`
- Project: `./bwc.config.json`