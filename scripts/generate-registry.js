#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { fetchDockerMCPServers } = require('./fetch-docker-mcp');

const REPO_ROOT = path.join(__dirname, '..');
const SUBAGENTS_DIR = path.join(REPO_ROOT, 'subagents');
const COMMANDS_DIR = path.join(REPO_ROOT, 'commands');
const MCP_SERVERS_DIR = path.join(REPO_ROOT, 'mcp-servers');
const OUTPUT_PATH = path.join(REPO_ROOT, 'web-ui', 'public', 'registry.json');

async function getSubagents() {
  const files = await fs.readdir(SUBAGENTS_DIR);
  const subagents = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(SUBAGENTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);
    
    subagents.push({
      name: data.name || file.replace('.md', ''),
      category: data.category || 'uncategorized',
      description: data.description || '',
      version: '1.0.0',
      file: `subagents/${file}`,
      path: file.replace('.md', ''),
      tools: data.tools || [],
      tags: data.tags || []
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
    
    commands.push({
      name: data.name || file.replace('.md', ''),
      category: data.category || 'uncategorized',
      description: data.description || '',
      version: '1.0.0',
      file: `commands/${file}`,
      path: file.replace('.md', ''),
      argumentHint: data.argumentHint || '<args>',
      model: data.model || 'claude-3.5',
      prefix: data.prefix || '/',
      tags: data.tags || []
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
          installation_methods: data.installation_methods || [],
          tags: data.tags || [],
          file: `mcp-servers/${subdir}/${file}`,
          path: `${subdir}/${file.replace('.md', '')}`
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
  try {
    console.log('Generating registry.json...');
    
    const [subagents, commands, mcpServers, dockerMCPServers] = await Promise.all([
      getSubagents(),
      getCommands(),
      getMCPServers(),
      fetchDockerMCPServers()
    ]);

    // Merge Docker MCP servers with existing MCP servers
    const allMCPServers = [...mcpServers, ...dockerMCPServers];
    
    // Remove duplicates based on server name
    const uniqueServers = allMCPServers.reduce((acc, server) => {
      if (!acc.find(s => s.name === server.name)) {
        acc.push(server);
      }
      return acc;
    }, []);

    const registry = {
      $schema: 'https://buildwithclaude.com/schema/registry.json',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      subagents,
      commands,
      mcpServers: uniqueServers.sort((a, b) => a.name.localeCompare(b.name))
    };

    // Ensure the public directory exists
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    
    // Write the registry file
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(registry, null, 2));
    
    console.log(`✓ Registry generated successfully!`);
    console.log(`  - ${subagents.length} subagents`);
    console.log(`  - ${commands.length} commands`);
    console.log(`  - ${uniqueServers.length} MCP servers (${dockerMCPServers.length} from Docker MCP)`);
    console.log(`  - Output: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('Error generating registry:', error);
    process.exit(1);
  }
}

// Run the script
generateRegistry();