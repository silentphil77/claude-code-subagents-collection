# Contributing to Claude Code Subagents & Commands Collection

Thank you for your interest in contributing to the Claude Code Subagents & Commands Collection! This guide will help you create high-quality subagents and commands that integrate seamlessly with Claude Code.

## Table of Contents
- [Before You Start](#before-you-start)
- [Contributing Subagents](#contributing-subagents)
  - [Creating a New Subagent](#creating-a-new-subagent)
  - [Subagent Structure](#subagent-structure)
  - [Testing Your Subagent](#testing-your-subagent)
- [Contributing Commands](#contributing-commands)
  - [Creating a New Command](#creating-a-new-command)
  - [Command Structure](#command-structure)
  - [Testing Your Command](#testing-your-command)
- [File Naming Conventions](#file-naming-conventions)
- [Writing Guidelines](#writing-guidelines)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [How Automated Checks Work](#how-automated-checks-work)
- [Code of Conduct](#code-of-conduct)

## Before You Start

1. **Read the documentation**: 
   - For subagents: [Claude Code's subagent documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
   - For commands: [Claude Code's slash commands documentation](https://docs.anthropic.com/en/docs/claude-code/slash-commands)
2. **Check existing contributions**: Ensure your idea doesn't overlap significantly with existing subagents or commands
3. **One purpose per contribution**: Each subagent or command should have a single, clear responsibility

## Contributing Subagents

### Creating a New Subagent

1. **Create your file** in the `subagents/` directory
2. **Name it appropriately**: `your-subagent-name.md`
3. **Follow the required structure** (see below)
4. **Test thoroughly** before submitting

### Subagent Structure

Every subagent MUST follow this exact structure:

```markdown
---
name: subagent-name
description: Clear, specific description of when this subagent should be invoked
category: category-name  # Required - see valid categories below
tools: tool1, tool2  # Optional - omit for all tools
---

You are a [role/expertise description].

## Role
[1-2 sentences describing the subagent's primary role]

## Capabilities
[List 3-5 key capabilities or areas of expertise]

## Approach
[Describe how the subagent should approach tasks]

## Output
[Specify what kind of output the subagent should provide]

[Additional specific instructions, examples, or guidelines]
```

### Field Requirements

#### Frontmatter (Required)
- **name**: 
  - Must match the filename (without .md)
  - Lowercase, hyphen-separated
  - Unique across all subagents
  
- **description**: 
  - Clear trigger conditions for automatic invocation
  - Include keywords that users might use
  - Mention if proactive use is expected
  - Keep under 500 characters

- **category** (Required):
  - Must be one of the following valid categories:
    - `development-architecture` - Backend, frontend, mobile, API design
    - `language-specialists` - Language-specific expertise (Python, Go, Rust, etc.)
    - `infrastructure-operations` - DevOps, cloud, deployment, databases
    - `quality-security` - Code review, security, testing, performance
    - `data-ai` - Data science, ML/AI engineering, analytics
    - `specialized-domains` - Domain-specific tools (payments, blockchain, etc.)
    - `crypto-trading` - Cryptocurrency and DeFi applications

- **tools** (Optional):
  - Only include if restricting tools
  - Use comma-separated list
  - Common tools: Read, Write, Edit, Bash, WebSearch, Task

#### System Prompt Sections

1. **Opening Statement** (Required):
   - Start with "You are a..."
   - Define expertise in one sentence

2. **## Role** (Recommended):
   - Expand on the opening statement
   - Clarify primary responsibilities

3. **## Capabilities** (Recommended):
   - List specific skills or knowledge areas
   - Use bullet points
   - Be concrete and actionable

4. **## Approach** (Recommended):
   - Describe methodology
   - Include step-by-step processes if applicable
   - Mention best practices to follow

5. **## Output** (Recommended):
   - Specify deliverables
   - Define format expectations
   - Include quality standards

## Writing Guidelines

### Do's
- ✅ Write clear, specific descriptions that help Claude Code know when to invoke
- ✅ Include concrete examples in the system prompt
- ✅ Use imperative mood ("Review code for...", not "Reviews code for...")
- ✅ Mention specific tools, frameworks, or technologies
- ✅ Include proactive triggers if appropriate ("Use immediately after...")
- ✅ Keep system prompts focused and under 500 lines
- ✅ Use markdown formatting for better readability

### Don'ts
- ❌ Create overlapping responsibilities with existing subagents
- ❌ Write vague or generic descriptions
- ❌ Include personal opinions or biases
- ❌ Use overly technical jargon without explanation
- ❌ Create subagents for malicious purposes
- ❌ Include external URLs or references that might change

### Example of a Well-Written Subagent

```markdown
---
name: api-validator
description: Validates REST API design, OpenAPI specs, and ensures API best practices. Use when designing or reviewing APIs.
category: development-architecture
tools: Read, Write, Edit, WebSearch
---

You are an API design expert specializing in RESTful services and OpenAPI specifications.

## Role
Ensure APIs follow REST principles, maintain consistency, and provide excellent developer experience through proper documentation and design.

## Capabilities
- Validate OpenAPI/Swagger specifications
- Review REST API design patterns
- Ensure proper HTTP status codes and methods
- Check API versioning strategies
- Validate request/response schemas

## Approach
1. Analyze API structure for REST compliance
2. Check naming conventions and consistency
3. Validate error handling and status codes
4. Review security considerations (authentication, rate limiting)
5. Ensure comprehensive documentation

## Output
- Detailed API review with specific improvements
- Updated OpenAPI specification if needed
- Examples of proper request/response formats
- Security recommendations
- Developer documentation templates
```

### Testing Your Subagent

Before submitting, test your subagent:

1. **Installation Test**:
   ```bash
   cp subagents/your-subagent.md ~/.claude/agents/
   # Restart Claude Code
   ```

2. **Invocation Tests**:
   - Test automatic invocation with relevant prompts
   - Test explicit invocation: "Use the [subagent-name] to..."
   - Test @ mention: "@agent-[subagent-name] please help with..."

3. **Functionality Tests**:
   - Verify it performs its stated capabilities
   - Check tool usage if restricted
   - Ensure output matches specifications

4. **Edge Cases**:
   - Test with ambiguous requests
   - Verify it doesn't activate inappropriately
   - Check interaction with other subagents

## Contributing Commands

### Creating a New Command

1. **Create your file** in the `commands/` directory
2. **Name it appropriately**: `your-command-name.md`
3. **Follow the required structure** (see below)
4. **Test the command** thoroughly

### Command Structure

Every command MUST follow this structure:

```markdown
---
description: Brief explanation of what the command does (10-200 chars)
category: category-name  # Required - see valid categories below
argument-hint: <optional-args>  # Optional - describe expected arguments
allowed-tools: tool1, tool2  # Optional - restrict tool usage
model: opus|sonnet|haiku  # Optional - specify model preference
---

# Command implementation

Detailed instructions for how the command should work...
```

#### Valid Command Categories:
- `ci-deployment` - CI/CD and deployment commands
- `code-analysis-testing` - Code quality and testing commands
- `context-loading-priming` - Context and priming commands
- `documentation-changelogs` - Documentation commands
- `project-task-management` - Project management commands
- `version-control-git` - Git and version control commands
- `miscellaneous` - Other specialized commands

### Testing Your Command

1. **Installation Test**:
   ```bash
   cp commands/your-command.md ~/.claude/commands/
   # Restart Claude Code
   ```

2. **Usage Tests**:
   - Test basic invocation: `/your_command`
   - Test with arguments: `/your_command arg1 arg2`
   - Verify error handling for invalid inputs

3. **Tool Restriction Tests**:
   - If you specified `allowed-tools`, verify only those tools are used
   - Test that restricted tools are not accessible

## File Naming Conventions

For both subagents and commands:

- **Format**: `descriptive-name.md`
- **Rules**:
  - Use lowercase letters only
  - Separate words with hyphens (-)
  - Be descriptive but concise
  - For subagents: Match the `name` field in frontmatter
  - For commands: Use underscores in the actual command (e.g., file `create-pr.md` becomes `/create_pr`)

**Good examples**:
- Subagents: `code-reviewer.md`, `python-pro.md`
- Commands: `create-pr.md`, `fix-issue.md`

**Bad examples**:
- `CodeReviewer.md` (wrong case)
- `code_reviewer.md` (underscores for subagents)
- `cr.md` (too vague)

## Submitting a Pull Request

### PR Requirements

1. **Branch Naming**: 
   - Subagents: `add-[subagent-name]` or `update-[subagent-name]`
   - Commands: `add-[command-name]` or `update-[command-name]`

2. **PR Title**: 
   - New subagent: "Add [subagent-name] subagent"
   - New command: "Add [command-name] command"
   - Updates: "Update [name]: [brief description]"

3. **PR Description Templates**:

   **For Subagents:**
   ```markdown
   ## Summary
   Brief description of the subagent and its purpose
   
   ## Subagent Details
   - **Name**: [subagent-name]
   - **Category**: [Development/Security/Data/etc.]
   - **Primary Use Case**: [When users should use this]
   
   ## Testing
   - [ ] Tested automatic invocation
   - [ ] Tested explicit invocation
   - [ ] Tested with restricted tools (if applicable)
   - [ ] No overlap with existing subagents
   
   ## Examples
   Provide 2-3 example prompts that trigger this subagent
   ```

   **For Commands:**
   ```markdown
   ## Summary
   Brief description of the command and its purpose
   
   ## Command Details
   - **Command**: /[command_name]
   - **Category**: [Git/Testing/Documentation/etc.]
   - **Arguments**: [describe any arguments]
   
   ## Testing
   - [ ] Tested basic usage
   - [ ] Tested with arguments (if applicable)
   - [ ] Tested error cases
   - [ ] Verified tool restrictions (if any)
   
   ## Examples
   Provide 2-3 example usages of the command
   ```

4. **Files to Update**:
   - For subagents: Add file to `subagents/` directory
   - For commands: Add file to `commands/` directory
   - Update `README.md` if adding significant new functionality

### Review Process

1. **Automated Checks** (see [How Automated Checks Work](#how-automated-checks-work)):
   - File naming conventions
   - Required structure validation
   - Markdown formatting
   - Frontmatter schema compliance
   - Duplicate name detection
   - Category validation

2. **Manual Review**:
   - Uniqueness and value proposition
   - Code quality and security
   - Documentation clarity
   - Integration with existing subagents

3. **Feedback Loop**:
   - Address reviewer comments
   - Make requested changes
   - Re-test after modifications

### Quality Standards

Your PR will be evaluated on:

- **Uniqueness**: Does it fill a genuine gap?
- **Clarity**: Is the purpose immediately clear?
- **Quality**: Is the system prompt well-written?
- **Integration**: Does it work well with other subagents?
- **Documentation**: Are examples and usage clear?
- **Security**: No malicious capabilities or prompts

### After Your PR is Merged

Once your pull request is approved and merged:

1. **Automatic Deployment**: Your subagent or command will be automatically available on the [Web UI](https://www.buildwithclaude.com) within minutes
2. **No Manual Steps Required**: The deployment is handled automatically by Vercel
3. **Immediate Availability**: Users can browse, copy, or download your contribution from the website
4. **Repository Sync**: The web UI always displays the latest subagents and commands from the main branch

This means contributors don't need to worry about deployment - just focus on creating quality subagents and commands!

## How Automated Checks Work

Our GitHub Actions workflow automatically validates all contributions. Here's what gets checked:

### Validation Process

When you submit a PR, the following checks run automatically:

#### For Subagents:

1. **Frontmatter Validation**:
   - Validates YAML structure against our JSON schema
   - Ensures required fields (`name`, `description`, `category`) are present
   - Checks field formats (e.g., name must be lowercase with hyphens)

2. **File Naming**:
   - Verifies filename matches the `name` field exactly
   - Example: `code-reviewer.md` must have `name: code-reviewer`

3. **Content Checks**:
   - Ensures opening statement starts with "You are a..."
   - Validates description length (10-500 characters recommended)
   - Checks for duplicate names across all subagents

4. **Category Validation**:
   - Ensures category is one of the valid options

#### For Commands:

1. **Frontmatter Validation**:
   - Validates required fields (`description`, `category`)
   - Checks optional fields format (`argument-hint`, `allowed-tools`, `model`)

2. **Content Validation**:
   - Ensures the command has implementation details
   - Validates description length (10-200 characters)

3. **Category Validation**:
   - Ensures category is one of the valid command categories

### Running Checks Locally

Before submitting your PR, run the validation locally:

```bash
# Install dependencies
npm install gray-matter ajv glob chalk

# Run validation for subagents
node scripts/validate-subagents.js

# Run validation for commands
node scripts/validate-commands.js
```

### Understanding Validation Output

The validator provides three types of feedback:

- **❌ Errors**: Must be fixed before merging
  - File name mismatches
  - Missing required fields
  - Invalid frontmatter structure
  - Duplicate subagent names

- **⚠️  Warnings**: Should be addressed but won't block merging
  - Description too long (>500 characters)
  - Missing recommended sections
  - Unknown tool names

- **✅ Success**: All checks passed

### Example Output

```
Checking code-reviewer.md...
Checking python-pro.md...

Validation Report
==================================================

❌ Errors (1):
  - api-documenter.md: File name 'api-documentor.md' doesn't match name field 'api-documenter'. Expected 'api-documenter.md'

⚠️  Warnings (2):
  - complex-analyzer.md: Description is 500 characters (recommended: under 500)
  - new-subagent.md: Missing opening statement "You are a..."

❌ Validation failed!
```

## Code of Conduct

- Be respectful and constructive
- Focus on improving Claude Code's capabilities
- No subagents for malicious purposes
- Respect intellectual property
- Help others improve their contributions

## Tips for Success

1. **Start Simple**: Begin with a clear, focused subagent
2. **Study Examples**: Review well-rated existing subagents
3. **Get Feedback Early**: Open a draft PR for discussion
4. **Iterate**: Be open to suggestions and improvements
5. **Document Well**: Good examples help users and reviewers

## Questions?

- Check existing [issues](https://github.com/davepoon/claude-code-subagents-collection/issues)
- Join the discussion in [pull requests](https://github.com/davepoon/claude-code-subagents-collection/pulls)
- Refer to [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

Thank you for contributing to make Claude Code more powerful for everyone!