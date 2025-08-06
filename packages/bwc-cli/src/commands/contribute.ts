import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { fileExists, readFile } from '../utils/files.js'
import { execa } from 'execa'
import { MCPServerSchema } from '../registry/types.js'
import yaml from 'js-yaml'

export function createContributeCommand() {
  return new Command('contribute')
    .description('Contribute an MCP server to the registry')
    .option('-f, --file <path>', 'path to MCP server markdown file')
    .option('--validate-only', 'only validate the file without creating a PR')
    .action(async (options) => {
      try {
        // Get file path
        let filePath = options.file
        if (!filePath) {
          const { inputPath } = await inquirer.prompt([
            {
              type: 'input',
              name: 'inputPath',
              message: 'Path to MCP server markdown file:',
              validate: async (input) => {
                if (!input) return 'File path is required'
                if (!(await fileExists(input))) return 'File does not exist'
                return true
              }
            }
          ])
          filePath = inputPath
        }
        
        // Validate file exists
        if (!(await fileExists(filePath))) {
          throw new Error(`File not found: ${filePath}`)
        }
        
        // Read and validate file
        logger.info('Validating MCP server definition...')
        const content = await readFile(filePath)
        
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
        if (!frontmatterMatch) {
          throw new Error('Invalid markdown file: No frontmatter found')
        }
        
        let serverData
        try {
          serverData = yaml.load(frontmatterMatch[1])
        } catch (error) {
          throw new Error(`Invalid YAML frontmatter: ${error}`)
        }
        
        // Validate against schema
        try {
          const validated = MCPServerSchema.parse(serverData)
          logger.success('✓ MCP server definition is valid')
          
          // Show summary
          logger.info('\nServer Summary:')
          logger.info(`  Name: ${validated.name}`)
          logger.info(`  Display Name: ${validated.display_name}`)
          logger.info(`  Category: ${validated.category}`)
          logger.info(`  Verification: ${validated.verification.status}`)
          
          if (validated.user_inputs && validated.user_inputs.length > 0) {
            logger.info(`  User Inputs: ${validated.user_inputs.length} configured`)
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Validation failed: ${error.message}`)
          }
          throw error
        }
        
        if (options.validateOnly) {
          logger.success('\nValidation complete!')
          return
        }
        
        // Check if git is available
        try {
          await execa('git', ['--version'])
        } catch {
          throw new Error('Git is not installed. Please install git to contribute.')
        }
        
        // Check if gh CLI is available
        let hasGhCli = false
        try {
          await execa('gh', ['--version'])
          hasGhCli = true
        } catch {
          logger.warn('GitHub CLI (gh) is not installed. You will need to create the PR manually.')
        }
        
        // Contribution guidelines
        logger.info('\n' + chalk.bold('Contribution Guidelines:'))
        logger.info('1. Your MCP server should be well-documented')
        logger.info('2. Include clear installation instructions')
        logger.info('3. Provide examples of usage')
        logger.info('4. Ensure security best practices are followed')
        logger.info('5. Test your configuration thoroughly')
        
        const { confirmContribute } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmContribute',
            message: 'Do you want to contribute this MCP server to the BWC registry?',
            default: true
          }
        ])
        
        if (!confirmContribute) {
          logger.info('Contribution cancelled')
          return
        }
        
        if (hasGhCli) {
          // Guide through PR creation with gh CLI
          logger.info('\n' + chalk.bold('Creating Pull Request with GitHub CLI'))
          
          const { prTitle, prBody } = await inquirer.prompt([
            {
              type: 'input',
              name: 'prTitle',
              message: 'Pull request title:',
              default: `Add MCP server: ${serverData.name}`
            },
            {
              type: 'editor',
              name: 'prBody',
              message: 'Pull request description (press Enter to open editor):',
              default: `## Summary
Add ${serverData.display_name} MCP server to the registry.

## Description
${serverData.description}

## Checklist
- [ ] Server definition validates against schema
- [ ] Documentation is complete
- [ ] Installation instructions are clear
- [ ] Tested with Claude Code
- [ ] Security considerations addressed
${serverData.user_inputs ? '- [ ] User input requirements documented' : ''}

## Category
${serverData.category}

## Verification Status
${serverData.verification.status}
`
            }
          ])
          
          logger.info('\nTo create the PR, follow these steps:')
          logger.info('1. Fork the BWC repository if you haven\'t already:')
          logger.info(chalk.gray('   gh repo fork anthropics/claude-code-subagents-collection --clone'))
          
          logger.info('\n2. Create a new branch:')
          logger.info(chalk.gray(`   git checkout -b add-mcp-${serverData.name}`))
          
          logger.info('\n3. Copy your MCP server file:')
          logger.info(chalk.gray(`   cp ${filePath} mcp-servers/${serverData.verification.status}/${serverData.name}.md`))
          
          logger.info('\n4. Commit and push:')
          logger.info(chalk.gray('   git add .'))
          logger.info(chalk.gray(`   git commit -m "Add ${serverData.name} MCP server"`))
          logger.info(chalk.gray(`   git push origin add-mcp-${serverData.name}`))
          
          logger.info('\n5. Create the pull request:')
          const prCommand = `gh pr create --title "${prTitle}" --body "${prBody.replace(/"/g, '\\"')}"`
          logger.info(chalk.gray(`   ${prCommand}`))
          
          // Offer to copy commands
          const { copyCommands } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'copyCommands',
              message: 'Copy all commands to clipboard?',
              default: false
            }
          ])
          
          if (copyCommands) {
            const commands = [
              'gh repo fork anthropics/claude-code-subagents-collection --clone',
              `git checkout -b add-mcp-${serverData.name}`,
              `cp ${filePath} mcp-servers/${serverData.verification.status}/${serverData.name}.md`,
              'git add .',
              `git commit -m "Add ${serverData.name} MCP server"`,
              `git push origin add-mcp-${serverData.name}`,
              prCommand
            ].join('\n')
            
            try {
              await execa('pbcopy', { input: commands })
              logger.success('Commands copied to clipboard!')
            } catch {
              logger.warn('Could not copy to clipboard. Please copy the commands manually.')
            }
          }
        } else {
          // Manual PR instructions
          logger.info('\n' + chalk.bold('Manual Pull Request Instructions:'))
          logger.info('1. Fork the repository: https://github.com/anthropics/claude-code-subagents-collection')
          logger.info('2. Clone your fork locally')
          logger.info(`3. Copy your file to: mcp-servers/${serverData.verification.status}/${serverData.name}.md`)
          logger.info('4. Commit and push to your fork')
          logger.info('5. Create a pull request on GitHub')
          logger.info('6. Use this title: ' + chalk.cyan(`Add MCP server: ${serverData.name}`))
          logger.info('7. Include a description of your MCP server and why it\'s useful')
        }
        
        logger.info('\n' + chalk.green('Thank you for contributing to the BWC ecosystem! 🎉'))
        logger.info('Your contribution helps the community discover and use new MCP servers.')
        
      } catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
      }
    })
}