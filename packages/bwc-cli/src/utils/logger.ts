import chalk from 'chalk'
import ora from 'ora'

export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  warn: (message: string) => console.log(chalk.yellow('⚠'), message),
  
  heading: (message: string) => console.log('\n' + chalk.bold(message)),
  
  list: (items: string[]) => {
    items.forEach(item => console.log(`  ${chalk.gray('•')} ${item}`))
  },
  
  code: (code: string) => console.log(chalk.gray(code)),
  
  spinner: (text: string) => ora(text).start()
}