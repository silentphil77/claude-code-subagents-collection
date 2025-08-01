# Claude Code Slash Commands Collection 🔪

A comprehensive collection of community-contributed slash commands for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), organized by category to enhance your development workflow.

## Overview

This directory contains 43 slash commands sourced from the Claude Code community, showcasing various ways to extend Claude Code's functionality through custom commands. Each command demonstrates different approaches to automating tasks, improving workflows, and integrating with development tools.

## Categories

### 🔧 Version Control & Git (12 commands)
Commands for Git operations, PR management, and version control workflows.

### 🧪 Code Analysis & Testing (6 commands)
Tools for code quality checks, testing, and performance optimization.

### 📥 Context Loading & Priming (7 commands)
Commands to load project context and prime Claude with relevant information.

### 📝 Documentation & Changelogs (5 commands)
Utilities for creating and maintaining documentation and changelogs.

### 🚀 CI / Deployment (2 commands)
Commands for continuous integration and deployment processes.

### 📋 Project & Task Management (6 commands)
Tools for project organization, task tracking, and requirement documentation.

### 🎯 Miscellaneous (5 commands)
Various specialized commands for specific use cases.

## Installation

To use these commands in your Claude Code setup:

1. **For individual commands**: Copy the desired `.md` file to your Claude commands directory:
   - User-level: `~/.claude/commands/`
   - Project-level: `.claude/commands/`

2. **For all commands in a category**: Copy an entire category folder to your commands directory.

3. **Restart Claude Code** to load the new commands.

## Usage

Once installed, you can invoke any command using the slash prefix:

```
/command-name [arguments]
```

For example:
- `/commit` - Create a conventional commit
- `/todo add "Fix bug in authentication"` - Add a todo item
- `/tdd` - Start test-driven development workflow

## Contributing

These commands were contributed by various members of the Claude Code community. Each command includes attribution to its original author and repository.

To contribute your own commands:
1. Create a well-documented command following the existing patterns
2. Submit a PR to the main repository
3. Include clear documentation and examples

## License

Individual commands may have different licenses as specified by their original authors. Please check each command file for specific license information.

## Acknowledgments

Special thanks to all the contributors who have shared their slash commands with the community. Your contributions help make Claude Code more powerful and accessible for everyone!

---

For more information about Claude Code slash commands, visit the [official documentation](https://docs.anthropic.com/en/docs/claude-code/slash-commands).