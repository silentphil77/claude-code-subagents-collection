#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const Ajv = require('ajv').default || require('ajv');
const { globSync } = require('glob');

// Initialize AJV for JSON schema validation
const ajv = new Ajv({ allErrors: true });

// Load the schema
const schema = require('./subagent-schema.json');

// Compile the schema
const validate = ajv.compile(schema);

// Track validation results
let hasErrors = false;
const errors = [];
const warnings = [];

// Find all subagent markdown files
const subagentFiles = globSync('*.md', {
  ignore: ['README.md', 'CONTRIBUTING.md', 'LICENSE']
});

console.log(`\n\x1b[34mValidating ${subagentFiles.length} subagent files...\x1b[0m\n`);

// Validate each file
subagentFiles.forEach(file => {
  console.log(`\x1b[90mChecking ${file}...\x1b[0m`);
  
  try {
    // Read file content
    const content = fs.readFileSync(file, 'utf8');
    
    // Parse frontmatter
    const parsed = matter(content);
    
    // Check if frontmatter exists
    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      errors.push({
        file,
        message: 'No frontmatter found'
      });
      hasErrors = true;
      return;
    }
    
    // Validate against schema
    const valid = validate(parsed.data);
    
    if (!valid) {
      validate.errors.forEach(error => {
        let message = error.message;
        if (error.instancePath) {
          message = `Field '${error.instancePath.replace('/', '')}' ${error.message}`;
        } else if (error.schemaPath.includes('/description/')) {
          message = `Description ${error.message}`;
        }
        errors.push({
          file,
          message: message,
          details: error
        });
      });
      hasErrors = true;
    }
    
    // Additional custom validations
    
    // 1. Check file name matches name field
    const expectedFileName = `${parsed.data.name}.md`;
    if (file !== expectedFileName) {
      errors.push({
        file,
        message: `File name '${file}' doesn't match name field '${parsed.data.name}'. Expected '${expectedFileName}'`
      });
      hasErrors = true;
    }
    
    // 2. Check description length
    if (parsed.data.description && parsed.data.description.length > 500) {
      warnings.push({
        file,
        message: `Description is ${parsed.data.description.length} characters (recommended: under 500)`
      });
    }
    
    // 3. Check for required content sections
    const contentLower = parsed.content.toLowerCase();
    
    if (!contentLower.includes('you are')) {
      warnings.push({
        file,
        message: 'Missing opening statement "You are a..."'
      });
    }
    
    // 4. Check for duplicate names across all files
    const allNames = subagentFiles.map(f => {
      try {
        const content = fs.readFileSync(f, 'utf8');
        const parsed = matter(content);
        return { file: f, name: parsed.data.name };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    const duplicates = allNames.filter(item => 
      item.name === parsed.data.name && item.file !== file
    );
    
    if (duplicates.length > 0) {
      errors.push({
        file,
        message: `Duplicate name '${parsed.data.name}' found in: ${duplicates.map(d => d.file).join(', ')}`
      });
      hasErrors = true;
    }
    
    // 5. Check tools field if present
    if (parsed.data.tools) {
      const validTools = ['Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'WebSearch', 'WebFetch', 'Task', 'TodoWrite', 'Grep', 'Glob', 'LS', 'NotebookRead', 'NotebookEdit'];
      const toolsList = parsed.data.tools.split(',').map(t => t.trim());
      
      toolsList.forEach(tool => {
        if (!validTools.includes(tool)) {
          warnings.push({
            file,
            message: `Unknown tool '${tool}'. Valid tools: ${validTools.join(', ')}`
          });
        }
      });
    }
    
    // 6. Check for markdown formatting issues
    if (content.includes('```') && !content.match(/```[\w-]*\n/)) {
      warnings.push({
        file,
        message: 'Code blocks should specify a language after the backticks'
      });
    }
    
  } catch (error) {
    errors.push({
      file,
      message: `Failed to parse file: ${error.message}`
    });
    hasErrors = true;
  }
});

// Generate report
console.log('\n\x1b[1mValidation Report\x1b[0m');
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log(`\x1b[31m\n❌ Errors (${errors.length}):\x1b[0m`);
  errors.forEach(error => {
    console.log(`\x1b[31m  - ${error.file}: ${error.message}\x1b[0m`);
  });
}

if (warnings.length > 0) {
  console.log(`\x1b[33m\n⚠️  Warnings (${warnings.length}):\x1b[0m`);
  warnings.forEach(warning => {
    console.log(`\x1b[33m  - ${warning.file}: ${warning.message}\x1b[0m`);
  });
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\x1b[32m\n✅ All validations passed!\x1b[0m');
}

// Write detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalFiles: subagentFiles.length,
  errors: errors.length,
  warnings: warnings.length,
  details: {
    errors,
    warnings
  }
};

fs.writeFileSync('validation-report.txt', JSON.stringify(report, null, 2));

// Exit with error code if validation failed
if (hasErrors) {
  console.log('\x1b[31m\n❌ Validation failed!\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32m\n✅ Validation successful!\x1b[0m');
  process.exit(0);
}