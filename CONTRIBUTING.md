# Contributing to Claude Code Subagents Collection

Thank you for your interest in contributing to the Claude Code Subagents Collection! This guide will help you create high-quality subagents that integrate seamlessly with Claude Code.

## Table of Contents
- [Before You Start](#before-you-start)
- [Creating a New Subagent](#creating-a-new-subagent)
- [File Naming Conventions](#file-naming-conventions)
- [Required Structure](#required-structure)
- [Writing Guidelines](#writing-guidelines)
- [Testing Your Subagent](#testing-your-subagent)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [How Automated Checks Work](#how-automated-checks-work)
- [Code of Conduct](#code-of-conduct)

## Before You Start

1. **Read the documentation**: Familiarize yourself with [Claude Code's subagent documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
2. **Check existing subagents**: Ensure your idea doesn't overlap significantly with existing subagents
3. **One purpose per subagent**: Each subagent should have a single, clear responsibility

## Creating a New Subagent

### File Naming Conventions

- **Format**: `descriptive-name.md`
- **Rules**:
  - Use lowercase letters only
  - Separate words with hyphens (-)
  - Be descriptive but concise
  - Match the `name` field in the frontmatter

**Good examples**:
- `code-reviewer.md`
- `python-pro.md`
- `database-optimizer.md`

**Bad examples**:
- `CodeReviewer.md` (wrong case)
- `code_reviewer.md` (underscores)
- `cr.md` (too vague)

### Required Structure

Every subagent MUST follow this exact structure:

```markdown
---
name: subagent-name
description: Clear, specific description of when this subagent should be invoked
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

## Testing Your Subagent

Before submitting, test your subagent:

1. **Installation Test**:
   ```bash
   cp your-subagent.md ~/.claude/agents/
   # Restart Claude Code
   ```

2. **Invocation Tests**:
   - Test automatic invocation with relevant prompts
   - Test explicit invocation: "Use the [subagent-name] to..."
   - Test @ mention: "@[subagent-name] please help with..."

3. **Functionality Tests**:
   - Verify it performs its stated capabilities
   - Check tool usage if restricted
   - Ensure output matches specifications

4. **Edge Cases**:
   - Test with ambiguous requests
   - Verify it doesn't activate inappropriately
   - Check interaction with other subagents

## Submitting a Pull Request

### PR Requirements

1. **Branch Naming**: `add-[subagent-name]` or `update-[subagent-name]`

2. **PR Title**: 
   - New: "Add [subagent-name] subagent"
   - Update: "Update [subagent-name]: [brief description]"

3. **PR Description Template**:
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

4. **Files to Update**:
   - Add your `subagent-name.md` file
   - Update `README.md`:
     - Add to the appropriate category section
     - Update the count in the overview
     - Add to the Recent Updates if significant

### Review Process

1. **Automated Checks** (see [How Automated Checks Work](#how-automated-checks-work)):
   - File naming conventions
   - Required structure validation
   - Markdown formatting
   - Frontmatter schema compliance
   - Duplicate name detection

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

## How Automated Checks Work

Our GitHub Actions workflow automatically validates all subagent contributions. Here's what gets checked:

### Validation Process

When you submit a PR, the following checks run automatically:

1. **Frontmatter Validation**:
   - Validates YAML structure against our JSON schema
   - Ensures required fields (`name`, `description`) are present
   - Checks field formats (e.g., name must be lowercase with hyphens)

2. **File Naming**:
   - Verifies filename matches the `name` field exactly
   - Example: `code-reviewer.md` must have `name: code-reviewer`

3. **Content Checks**:
   - Ensures opening statement starts with "You are a..."
   - Validates description length (10-500 characters recommended)
   - Checks for duplicate names across all subagents

4. **Tool Validation**:
   - If `tools` field is present, validates against known tools
   - Warns about unknown tool names

### Running Checks Locally

Before submitting your PR, run the validation locally:

```bash
# Install dependencies
npm install gray-matter ajv glob chalk

# Run validation
node scripts/validate-subagents.js
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