import { HttpProxyAgent } from 'http-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import type { Agent as HttpAgent } from 'http'
import type { Agent as HttpsAgent } from 'https'

export interface ProxyConfig {
  httpAgent?: HttpAgent
  httpsAgent?: HttpsAgent
}

/**
 * Parse NO_PROXY environment variable and check if a URL should bypass proxy
 */
function shouldBypassProxy(url: string, noProxy?: string): boolean {
  if (!noProxy) return false
  
  const hostname = new URL(url).hostname.toLowerCase()
  const noProxyList = noProxy.split(',').map(s => s.trim().toLowerCase())
  
  for (const pattern of noProxyList) {
    if (!pattern) continue
    
    // Handle wildcards like *.example.com
    if (pattern.startsWith('*.')) {
      const domain = pattern.slice(2)
      if (hostname.endsWith(domain)) return true
    }
    // Handle exact matches
    else if (hostname === pattern || hostname.endsWith('.' + pattern)) {
      return true
    }
    // Handle localhost variations
    else if (pattern === 'localhost' && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
      return true
    }
  }
  
  return false
}

/**
 * Get proxy URL from environment variables
 */
function getProxyUrl(protocol: 'http' | 'https'): string | undefined {
  // Check protocol-specific variables first (case insensitive)
  const protocolSpecific = protocol === 'https' 
    ? process.env.HTTPS_PROXY || process.env.https_proxy
    : process.env.HTTP_PROXY || process.env.http_proxy
  
  if (protocolSpecific) return protocolSpecific
  
  // Fall back to general HTTP_PROXY for HTTPS requests (common pattern)
  if (protocol === 'https') {
    return process.env.HTTP_PROXY || process.env.http_proxy
  }
  
  return undefined
}

/**
 * Create proxy configuration based on environment variables
 * Supports HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables
 */
export function createProxyConfig(targetUrl?: string): ProxyConfig {
  const config: ProxyConfig = {}
  
  // Get NO_PROXY list
  const noProxy = process.env.NO_PROXY || process.env.no_proxy
  
  // Check if we should bypass proxy for this specific URL
  if (targetUrl && shouldBypassProxy(targetUrl, noProxy)) {
    return config // Return empty config to use default agents
  }
  
  // Configure HTTP proxy agent
  const httpProxy = getProxyUrl('http')
  if (httpProxy) {
    config.httpAgent = new HttpProxyAgent(httpProxy, {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256
    })
  }
  
  // Configure HTTPS proxy agent
  const httpsProxy = getProxyUrl('https')
  if (httpsProxy) {
    config.httpsAgent = new HttpsProxyAgent(httpsProxy, {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 256,
      maxFreeSockets: 256,
      // Allow custom CA certificates if configured
      ...(process.env.NODE_EXTRA_CA_CERTS ? {
        ca: process.env.NODE_EXTRA_CA_CERTS
      } : {})
    })
  }
  
  return config
}

/**
 * Get proxy configuration for got requests
 * Returns an object suitable for got's agent option
 */
export function getGotProxyOptions(targetUrl: string): { agent?: { http?: HttpAgent; https?: HttpsAgent } } {
  const proxyConfig = createProxyConfig(targetUrl)
  
  if (!proxyConfig.httpAgent && !proxyConfig.httpsAgent) {
    return {} // No proxy configured
  }
  
  return {
    agent: {
      ...(proxyConfig.httpAgent && { http: proxyConfig.httpAgent }),
      ...(proxyConfig.httpsAgent && { https: proxyConfig.httpsAgent })
    }
  }
}

/**
 * Check if proxy is configured via environment variables
 */
export function isProxyConfigured(): boolean {
  return !!(
    process.env.HTTP_PROXY || 
    process.env.http_proxy || 
    process.env.HTTPS_PROXY || 
    process.env.https_proxy
  )
}

/**
 * Get a human-readable description of the current proxy configuration
 */
export function getProxyDescription(): string {
  if (!isProxyConfigured()) {
    return 'No proxy configured'
  }
  
  const parts: string[] = []
  
  const httpProxy = getProxyUrl('http')
  const httpsProxy = getProxyUrl('https')
  const noProxy = process.env.NO_PROXY || process.env.no_proxy
  
  if (httpProxy) {
    parts.push(`HTTP: ${httpProxy}`)
  }
  
  if (httpsProxy && httpsProxy !== httpProxy) {
    parts.push(`HTTPS: ${httpsProxy}`)
  }
  
  if (noProxy) {
    parts.push(`NO_PROXY: ${noProxy}`)
  }
  
  return parts.join(', ')
}