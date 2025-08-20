#!/usr/bin/env node

/**
 * Manual integration test for proxy support
 * Run this script with proxy environment variables to test proxy functionality
 * 
 * Example:
 * HTTPS_PROXY=http://your-proxy:8080 node tests/integration/proxy-test.js
 */

import { RegistryClient } from '../../src/registry/client.js'
import { ConfigManager } from '../../src/config/manager.js'
import { isProxyConfigured, getProxyDescription } from '../../src/utils/proxy.js'

async function testProxySupport() {
  console.log('=== BWC CLI Proxy Support Test ===\n')
  
  // Check proxy configuration
  if (isProxyConfigured()) {
    console.log('✅ Proxy configured:')
    console.log(`   ${getProxyDescription()}\n`)
  } else {
    console.log('❌ No proxy configured')
    console.log('   Set HTTP_PROXY or HTTPS_PROXY environment variables to test proxy support\n')
  }
  
  // Test registry fetch
  console.log('Testing registry fetch...')
  try {
    const configManager = ConfigManager.getInstance()
    const registryClient = new RegistryClient(configManager)
    
    const startTime = Date.now()
    const registry = await registryClient.fetchRegistry()
    const endTime = Date.now()
    
    console.log(`✅ Successfully fetched registry in ${endTime - startTime}ms`)
    console.log(`   Found ${registry.subagents?.length || 0} subagents`)
    console.log(`   Found ${registry.commands?.length || 0} commands`)
    console.log(`   Found ${registry.mcpServers?.length || 0} MCP servers\n`)
    
    // Test file content fetch
    if (registry.subagents && registry.subagents.length > 0) {
      console.log('Testing file content fetch...')
      const testAgent = registry.subagents[0]
      
      const fileStartTime = Date.now()
      const content = await registryClient.fetchFileContent(testAgent.fileUrl)
      const fileEndTime = Date.now()
      
      console.log(`✅ Successfully fetched file content in ${fileEndTime - fileStartTime}ms`)
      console.log(`   File: ${testAgent.fileUrl}`)
      console.log(`   Size: ${content.length} bytes\n`)
    }
    
    console.log('✅ All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testProxySupport().catch(console.error)