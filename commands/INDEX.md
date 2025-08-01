# Slash Commands Index

Complete listing of all slash commands in this collection, organized by category.

## Version Control & Git

### `/bug-fix` 
**Author**: [danielscholl](https://github.com/danielscholl)  
**Description**: Streamlines bug fixing by creating a GitHub issue first, then a feature branch for implementing and thoroughly testing the solution before merging.  
**File**: [version-control-git/bug-fix.md](version-control-git/bug-fix.md)

### `/commit`
**Author**: [evmts](https://github.com/evmts) ⚖️ MIT  
**Description**: Creates git commits using conventional commit format with appropriate emojis, following project standards and creating descriptive messages that explain the purpose of changes.  
**File**: [version-control-git/commit.md](version-control-git/commit.md)

### `/commit-fast`
**Author**: [steadycursor](https://github.com/steadycursor)  
**Description**: Automates git commit process by selecting the first suggested message, generating structured commits with consistent formatting while skipping manual confirmation.  
**File**: [version-control-git/commit-fast.md](version-control-git/commit-fast.md)

### `/create-pr`
**Author**: [toyamarinyon](https://github.com/toyamarinyon) ⚖️ Apache-2.0  
**Description**: Streamlines pull request creation by handling the entire workflow: creating a new branch, committing changes, formatting modified files with Biome, and submitting the PR.  
**File**: [version-control-git/create-pr.md](version-control-git/create-pr.md)

### `/create-pull-request`
**Author**: [liam-hq](https://github.com/liam-hq) ⚖️ Apache-2.0  
**Description**: Provides comprehensive PR creation guidance with GitHub CLI, enforcing title conventions, following template structure, and offering concrete command examples with best practices.  
**File**: [version-control-git/create-pull-request.md](version-control-git/create-pull-request.md)

### `/create-worktrees`
**Author**: [evmts](https://github.com/evmts) ⚖️ MIT  
**Description**: Creates git worktrees for all open PRs or specific branches, handling branches with slashes, cleaning up stale worktrees, and supporting custom branch creation for development.  
**File**: [version-control-git/create-worktrees.md](version-control-git/create-worktrees.md)

### `/fix-github-issue`
**Author**: [jeremymailen](https://github.com/jeremymailen) ⚖️ Apache-2.0  
**Description**: Analyzes and fixes GitHub issues using a structured approach with GitHub CLI for issue details, implementing necessary code changes, running tests, and creating proper commit messages.  
**File**: [version-control-git/fix-github-issue.md](version-control-git/fix-github-issue.md)

### `/fix-issue`
**Author**: [metabase](https://github.com/metabase) ⚖️ NOASSERTION  
**Description**: Addresses GitHub issues by taking issue number as parameter, analyzing context, implementing solution, and testing/validating the fix for proper integration.  
**File**: [version-control-git/fix-issue.md](version-control-git/fix-issue.md)

### `/fix-pr`
**Author**: [metabase](https://github.com/metabase) ⚖️ NOASSERTION  
**Description**: Fetches and fixes unresolved PR comments by automatically retrieving feedback, addressing reviewer concerns, making targeted code improvements, and streamlining the review process.  
**File**: [version-control-git/fix-pr.md](version-control-git/fix-pr.md)

### `/husky`
**Author**: [evmts](https://github.com/evmts) ⚖️ MIT  
**Description**: Sets up and manages Husky Git hooks by configuring pre-commit hooks, establishing commit message standards, integrating with linting tools, and ensuring code quality on commits.  
**File**: [version-control-git/husky.md](version-control-git/husky.md)

### `/pr-review`
**Author**: [arkavo-org](https://github.com/arkavo-org) ⚖️ MIT  
**Description**: Reviews pull request changes to provide feedback, check for issues, and suggest improvements before merging into the main codebase.  
**File**: [version-control-git/pr-review.md](version-control-git/pr-review.md)

### `/update-branch-name`
**Author**: [giselles-ai](https://github.com/giselles-ai) ⚖️ Apache-2.0  
**Description**: Updates branch names with proper prefixes and formats, enforcing naming conventions, supporting semantic prefixes, and managing remote branch updates.  
**File**: [version-control-git/update-branch-name.md](version-control-git/update-branch-name.md)

## Code Analysis & Testing

### `/check`
**Author**: [rygwdn](https://github.com/rygwdn)  
**Description**: Performs comprehensive code quality and security checks, featuring static analysis integration, security vulnerability scanning, code style enforcement, and detailed reporting.  
**File**: [code-analysis-testing/check.md](code-analysis-testing/check.md)

### `/clean`
**Author**: [Graphlet-AI](https://github.com/Graphlet-AI) ⚖️ Apache-2.0  
**Description**: Addresses code formatting and quality issues by fixing black formatting problems, organizing imports with isort, resolving flake8 linting issues, and correcting mypy type errors.  
**File**: [code-analysis-testing/clean.md](code-analysis-testing/clean.md)

### `/code_analysis`
**Author**: [kingler](https://github.com/kingler)  
**Description**: Provides a menu of advanced code analysis commands for deep inspection, including knowledge graph generation, optimization suggestions, and quality evaluation.  
**File**: [code-analysis-testing/code_analysis.md](code-analysis-testing/code_analysis.md)

### `/optimize`
**Author**: [to4iki](https://github.com/to4iki) ⚖️ MIT  
**Description**: Analyzes code performance to identify bottlenecks, proposing concrete optimizations with implementation guidance for improved application performance.  
**File**: [code-analysis-testing/optimize.md](code-analysis-testing/optimize.md)

### `/repro-issue`
**Author**: [rzykov](https://github.com/rzykov) ⚖️ NOASSERTION  
**Description**: Creates reproducible test cases for GitHub issues, ensuring tests fail reliably and documenting clear reproduction steps for developers.  
**File**: [code-analysis-testing/repro-issue.md](code-analysis-testing/repro-issue.md)

### `/tdd`
**Author**: [zscott](https://github.com/zscott)  
**Description**: Guides development using Test-Driven Development principles, enforcing Red-Green-Refactor discipline, integrating with git workflow, and managing PR creation.  
**File**: [code-analysis-testing/tdd.md](code-analysis-testing/tdd.md)

## Context Loading & Priming

### `/context-prime`
**Author**: [elizaOS](https://github.com/elizaOS) ⚖️ MIT  
**Description**: Primes Claude with comprehensive project understanding by loading repository structure, setting development context, establishing project goals, and defining collaboration parameters.  
**File**: [context-loading-priming/context-prime.md](context-loading-priming/context-prime.md)

### `/initref`
**Author**: [okuvshynov](https://github.com/okuvshynov) ⚖️ MIT  
**Description**: Initializes reference documentation structure with standard doc templates, API reference setup, documentation conventions, and placeholder content generation.  
**File**: [context-loading-priming/initref.md](context-loading-priming/initref.md)

### `/load-llms-txt`
**Author**: [ethpandaops](https://github.com/ethpandaops) ⚖️ MIT  
**Description**: Loads LLM configuration files to context, importing specific terminology, model configurations, and establishing baseline terminology for AI discussions.  
**File**: [context-loading-priming/load-llms-txt.md](context-loading-priming/load-llms-txt.md)

### `/load_coo_context`
**Author**: [Mjvolk3](https://github.com/Mjvolk3)  
**Description**: References specific files for sparse matrix operations, explains transform usage, compares with previous approaches, and sets data formatting context for development.  
**File**: [context-loading-priming/load_coo_context.md](context-loading-priming/load_coo_context.md)

### `/load_dango_pipeline`
**Author**: [Mjvolk3](https://github.com/Mjvolk3)  
**Description**: Sets context for model training by referencing pipeline files, establishing working context, and preparing for pipeline work with relevant documentation.  
**File**: [context-loading-priming/load_dango_pipeline.md](context-loading-priming/load_dango_pipeline.md)

### `/prime`
**Author**: [yzyydev](https://github.com/yzyydev)  
**Description**: Sets up initial project context by viewing directory structure and reading key files, creating standardized context with directory visualization and key documentation focus.  
**File**: [context-loading-priming/prime.md](context-loading-priming/prime.md)

### `/rsi`
**Author**: [ddisisto](https://github.com/ddisisto)  
**Description**: Reads all commands and key project files to optimize AI-assisted development by streamlining the process, loading command context, and setting up for better development workflow.  
**File**: [context-loading-priming/rsi.md](context-loading-priming/rsi.md)

## Documentation & Changelogs

### `/add-to-changelog`
**Author**: [berrydev-ai](https://github.com/berrydev-ai) ⚖️ MIT  
**Description**: Adds new entries to changelog files while maintaining format consistency, properly documenting changes, and following established project standards for version tracking.  
**File**: [documentation-changelogs/add-to-changelog.md](documentation-changelogs/add-to-changelog.md)

### `/create-docs`
**Author**: [jerseycheese](https://github.com/jerseycheese) ⚖️ MIT  
**Description**: Analyzes code structure and purpose to create comprehensive documentation detailing inputs/outputs, behavior, user interaction flows, and edge cases with error handling.  
**File**: [documentation-changelogs/create-docs.md](documentation-changelogs/create-docs.md)

### `/docs`
**Author**: [slunsford](https://github.com/slunsford)  
**Description**: Generates comprehensive documentation that follows project structure, documenting APIs and usage patterns with consistent formatting for better user understanding.  
**File**: [documentation-changelogs/docs.md](documentation-changelogs/docs.md)

### `/explain-issue-fix`
**Author**: [hackdays-io](https://github.com/hackdays-io)  
**Description**: Documents solution approaches for GitHub issues, explaining technical decisions, detailing challenges overcome, and providing implementation context for better understanding.  
**File**: [documentation-changelogs/explain-issue-fix.md](documentation-changelogs/explain-issue-fix.md)

### `/update-docs`
**Author**: [Consiliency](https://github.com/Consiliency) ⚖️ MIT  
**Description**: Reviews current documentation status, updates implementation progress, reviews phase documents, and maintains documentation consistency across the project.  
**File**: [documentation-changelogs/update-docs.md](documentation-changelogs/update-docs.md)

## CI / Deployment

### `/release`
**Author**: [kelp](https://github.com/kelp) ⚖️ MIT  
**Description**: Manages software releases by updating changelogs, reviewing README changes, evaluating version increments, and documenting release changes for better version tracking.  
**File**: [ci-deployment/release.md](ci-deployment/release.md)

### `/run-ci`
**Author**: [hackdays-io](https://github.com/hackdays-io)  
**Description**: Activates virtual environments, runs CI-compatible check scripts, iteratively fixes errors, and ensures all tests pass before completion.  
**File**: [ci-deployment/run-ci.md](ci-deployment/run-ci.md)

## Project & Task Management

### `/create-command`
**Author**: [scopecraft](https://github.com/scopecraft)  
**Description**: Guides Claude through creating new custom commands with proper structure by analyzing requirements, templating commands by category, enforcing command standards, and creating supporting documentation.  
**File**: [project-task-management/create-command.md](project-task-management/create-command.md)

### `/create-jtbd`
**Author**: [taddyorg](https://github.com/taddyorg) ⚖️ AGPL-3.0  
**Description**: Creates Jobs-to-be-Done frameworks that outline user needs with structured format, focusing on specific user problems and organizing by job categories for product development.  
**File**: [project-task-management/create-jtbd.md](project-task-management/create-jtbd.md)

### `/create-prd`
**Author**: [taddyorg](https://github.com/taddyorg) ⚖️ AGPL-3.0  
**Description**: Generates comprehensive product requirement documents outlining detailed specifications, requirements, and features following standardized document structure and format.  
**File**: [project-task-management/create-prd.md](project-task-management/create-prd.md)

### `/create-prp`
**Author**: [Wirasm](https://github.com/Wirasm) ⚖️ MIT  
**Description**: Creates product requirement plans by reading PRP methodology, following template structure, creating comprehensive requirements, and structuring product definitions for development.  
**File**: [project-task-management/create-prp.md](project-task-management/create-prp.md)

### `/project_hello_w_name`
**Author**: [disler](https://github.com/disler)  
**Description**: Creates customizable greeting components with name input, demonstrating argument passing, component reusability, state management, and user input handling.  
**File**: [project-task-management/project_hello_w_name.md](project-task-management/project_hello_w_name.md)

### `/todo`
**Author**: [chrisleyva](https://github.com/chrisleyva) ⚖️ MIT  
**Description**: A convenient command to quickly manage project todo items without leaving the Claude Code interface, featuring due dates, sorting, task prioritization, and comprehensive todo list management.  
**File**: [project-task-management/todo.md](project-task-management/todo.md)

## Miscellaneous

### `/five`
**Author**: [TuckerTucker](https://github.com/TuckerTucker)  
**Description**: Applies the "five whys" methodology to perform root cause analysis, identify underlying issues, and create solution approaches for complex problems.  
**File**: [miscellaneous/five.md](miscellaneous/five.md)

### `/fixing_go_in_graph`
**Author**: [Mjvolk3](https://github.com/Mjvolk3)  
**Description**: Focuses on Gene Ontology annotation integration in graph databases, handling multiple data sources, addressing graph representation issues, and ensuring correct data incorporation.  
**File**: [miscellaneous/fixing_go_in_graph.md](miscellaneous/fixing_go_in_graph.md)

### `/mermaid`
**Author**: [GaloyMoney](https://github.com/GaloyMoney) ⚖️ NOASSERTION  
**Description**: Generates Mermaid diagrams from SQL schema files, creating entity relationship diagrams with table properties, validating diagram compilation, and ensuring complete entity coverage.  
**File**: [miscellaneous/mermaid.md](miscellaneous/mermaid.md)

### `/review_dcell_model`
**Author**: [Mjvolk3](https://github.com/Mjvolk3)  
**Description**: Reviews old Dcell implementation files, comparing with newer Dango model, noting changes over time, and analyzing refactoring approaches for better code organization.  
**File**: [miscellaneous/review_dcell_model.md](miscellaneous/review_dcell_model.md)

### `/use-stepper`
**Author**: [zuplo](https://github.com/zuplo)  
**Description**: Reformats documentation to use React Stepper component, transforming heading formats, applying proper indentation, and maintaining markdown compatibility with admonition formatting.  
**File**: [miscellaneous/use-stepper.md](miscellaneous/use-stepper.md)

---

## Statistics

- **Total Commands**: 43
- **Version Control & Git**: 12 commands
- **Code Analysis & Testing**: 6 commands
- **Context Loading & Priming**: 7 commands
- **Documentation & Changelogs**: 5 commands
- **CI / Deployment**: 2 commands
- **Project & Task Management**: 6 commands
- **Miscellaneous**: 5 commands

## License Information

Commands marked with ⚖️ include explicit license information:
- MIT: 11 commands
- Apache-2.0: 5 commands
- AGPL-3.0: 2 commands
- NOASSERTION: 4 commands
- No explicit license: 21 commands