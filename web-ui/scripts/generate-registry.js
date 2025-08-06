#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

// Adjust paths to work from web-ui/scripts directory
const REPO_ROOT = path.join(__dirname, '..', '..');
const SUBAGENTS_DIR = path.join(REPO_ROOT, 'subagents');
const COMMANDS_DIR = path.join(REPO_ROOT, 'commands');
const MCP_SERVERS_DIR = path.join(REPO_ROOT, 'mcp-servers');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'registry.json');

async function getSubagents() {
  const files = await fs.readdir(SUBAGENTS_DIR);
  const subagents = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(SUBAGENTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);
    
    subagents.push({
      name: data.name,
      category: data.category || 'uncategorized',
      description: data.description || '',
      version: '1.0.0',
      file: `subagents/${file}`,
      tools: data.tools ? data.tools.split(',').map(t => t.trim()) : [],
      path: file
    });
  }
  
  return subagents.sort((a, b) => a.name.localeCompare(b.name));
}

async function getCommands() {
  const files = await fs.readdir(COMMANDS_DIR);
  const commands = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(COMMANDS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);
    
    // Command name is the filename without .md
    const commandName = file.replace('.md', '');
    
    commands.push({
      name: commandName,
      category: data.category || 'uncategorized',
      description: data.description || '',
      version: '1.0.0',
      file: `commands/${file}`,
      path: file,
      argumentHint: data['argument-hint'] || '',
      model: data.model || ''
    });
  }
  
  return commands.sort((a, b) => a.name.localeCompare(b.name));
}

async function getMCPServers() {
  const mcpServers = [];
  
  // Process all subdirectories (verified, community, experimental)
  const subdirs = ['verified', 'community', 'experimental'];
  
  for (const subdir of subdirs) {
    const dirPath = path.join(MCP_SERVERS_DIR, subdir);
    
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        if (!file.endsWith('.md') || file === 'TEMPLATE.md') continue;
        
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { data } = matter(content);
        
        // Add BWC installation method if not already present
        const installationMethods = data.installation_methods || [];
        
        // Add BWC method as the first option
        const bwcMethod = {
          type: 'bwc',
          recommended: true,
          command: `bwc add --mcp ${data.name || file.replace('.md', '')}`
        };
        
        // Check if BWC method already exists
        const hasBwcMethod = installationMethods.some(m => m.type === 'bwc');
        if (!hasBwcMethod) {
          installationMethods.unshift(bwcMethod);
        }
        
        // Add subdirectory info to the server data
        mcpServers.push({
          name: data.name || file.replace('.md', ''),
          display_name: data.display_name || data.name,
          category: data.category || 'uncategorized',
          description: data.description || '',
          server_type: data.server_type || 'stdio',
          protocol_version: data.protocol_version || '1.0.0',
          verification: data.verification || { status: subdir },
          sources: data.sources || {},
          security: data.security || {},
          stats: data.stats || {},
          installation_methods: installationMethods,
          tags: data.tags || [],
          file: `mcp-servers/${subdir}/${file}`,
          path: `${subdir}/${file.replace('.md', '')}`,
          // Include user inputs if present
          ...(data.user_inputs && { user_inputs: data.user_inputs }),
          // Include source registry if present
          ...(data.source_registry && { source_registry: data.source_registry }),
          // Include config schema if present
          ...(data.config_schema && { config_schema: data.config_schema })
        });
      }
    } catch (error) {
      // Directory might not exist yet
      console.warn(`Warning: ${dirPath} not found, skipping...`);
    }
  }
  
  return mcpServers.sort((a, b) => a.name.localeCompare(b.name));
}

async function generateRegistry() {
  console.log('Generating registry.json...');
  
  try {
    const [subagents, commands, mcpServers] = await Promise.all([
      getSubagents(),
      getCommands(),
      getMCPServers()
    ]);
    
    const registry = {
      $schema: 'https://buildwithclaude.com/schema/registry.json',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      subagents,
      commands,
      mcpServers
    };
    
    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    await fs.mkdir(publicDir, { recursive: true });
    
    await fs.writeFile(
      OUTPUT_PATH, 
      JSON.stringify(registry, null, 2)
    );
    
    console.log('✓ Registry generated successfully!');
    console.log(`  - ${subagents.length} subagents`);
    console.log(`  - ${commands.length} commands`);
    console.log(`  - ${mcpServers.length} MCP servers`);
    console.log(`  - Output: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error generating registry:', error);
    process.exit(1);
  }
}

generateRegistry();