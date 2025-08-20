import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  createProxyConfig, 
  getGotProxyOptions, 
  isProxyConfigured,
  getProxyDescription 
} from '../../../src/utils/proxy.js'

describe('Proxy Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
    // Clear proxy-related environment variables
    delete process.env.HTTP_PROXY
    delete process.env.http_proxy
    delete process.env.HTTPS_PROXY
    delete process.env.https_proxy
    delete process.env.NO_PROXY
    delete process.env.no_proxy
    delete process.env.NODE_EXTRA_CA_CERTS
  })

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe('isProxyConfigured', () => {
    it('should return false when no proxy is configured', () => {
      expect(isProxyConfigured()).toBe(false)
    })

    it('should return true when HTTP_PROXY is set', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      expect(isProxyConfigured()).toBe(true)
    })

    it('should return true when http_proxy is set (lowercase)', () => {
      process.env.http_proxy = 'http://proxy.example.com:8080'
      expect(isProxyConfigured()).toBe(true)
    })

    it('should return true when HTTPS_PROXY is set', () => {
      process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      expect(isProxyConfigured()).toBe(true)
    })

    it('should return true when https_proxy is set (lowercase)', () => {
      process.env.https_proxy = 'https://proxy.example.com:8080'
      expect(isProxyConfigured()).toBe(true)
    })
  })

  describe('createProxyConfig', () => {
    it('should return empty config when no proxy is configured', () => {
      const config = createProxyConfig()
      expect(config.httpAgent).toBeUndefined()
      expect(config.httpsAgent).toBeUndefined()
    })

    it('should create HTTP agent when HTTP_PROXY is set', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      const config = createProxyConfig()
      expect(config.httpAgent).toBeDefined()
      // HTTPS agent is also created using HTTP_PROXY as fallback
      expect(config.httpsAgent).toBeDefined()
    })

    it('should create HTTPS agent when HTTPS_PROXY is set', () => {
      process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      const config = createProxyConfig()
      expect(config.httpsAgent).toBeDefined()
    })

    it('should use HTTP_PROXY for HTTPS when HTTPS_PROXY is not set', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      const config = createProxyConfig()
      expect(config.httpAgent).toBeDefined()
      expect(config.httpsAgent).toBeDefined()
    })

    it('should create both agents when both proxies are configured', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      process.env.HTTPS_PROXY = 'https://secure-proxy.example.com:8443'
      const config = createProxyConfig()
      expect(config.httpAgent).toBeDefined()
      expect(config.httpsAgent).toBeDefined()
    })

    describe('NO_PROXY handling', () => {
      beforeEach(() => {
        process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
        process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      })

      it('should bypass proxy for localhost', () => {
        process.env.NO_PROXY = 'localhost'
        const config = createProxyConfig('http://localhost:3000')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })

      it('should bypass proxy for 127.0.0.1', () => {
        process.env.NO_PROXY = 'localhost'
        const config = createProxyConfig('http://127.0.0.1:3000')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })

      it('should bypass proxy for exact domain match', () => {
        process.env.NO_PROXY = 'example.com'
        const config = createProxyConfig('https://example.com/api')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })

      it('should bypass proxy for subdomain with wildcard', () => {
        process.env.NO_PROXY = '*.example.com'
        const config = createProxyConfig('https://api.example.com/v1')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })

      it('should bypass proxy for multiple domains', () => {
        process.env.NO_PROXY = 'localhost,example.com,*.internal.net'
        
        const config1 = createProxyConfig('http://localhost:3000')
        expect(config1.httpAgent).toBeUndefined()
        
        const config2 = createProxyConfig('https://example.com')
        expect(config2.httpAgent).toBeUndefined()
        
        const config3 = createProxyConfig('https://api.internal.net')
        expect(config3.httpAgent).toBeUndefined()
      })

      it('should not bypass proxy for non-matching domains', () => {
        process.env.NO_PROXY = 'example.com'
        const config = createProxyConfig('https://other.com/api')
        expect(config.httpsAgent).toBeDefined()
      })

      it('should handle NO_PROXY with spaces', () => {
        process.env.NO_PROXY = 'localhost, example.com , *.internal.net'
        const config = createProxyConfig('https://example.com')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })

      it('should be case insensitive for NO_PROXY', () => {
        process.env.no_proxy = 'EXAMPLE.COM'
        const config = createProxyConfig('https://example.com')
        expect(config.httpAgent).toBeUndefined()
        expect(config.httpsAgent).toBeUndefined()
      })
    })
  })

  describe('getGotProxyOptions', () => {
    it('should return empty object when no proxy is configured', () => {
      const options = getGotProxyOptions('https://api.example.com')
      expect(options).toEqual({})
    })

    it('should return agent options when proxy is configured', () => {
      process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      const options = getGotProxyOptions('https://api.example.com')
      expect(options.agent).toBeDefined()
      expect(options.agent?.https).toBeDefined()
    })

    it('should return empty object for NO_PROXY matches', () => {
      process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      process.env.NO_PROXY = 'api.example.com'
      const options = getGotProxyOptions('https://api.example.com')
      expect(options).toEqual({})
    })
  })

  describe('getProxyDescription', () => {
    it('should return "No proxy configured" when no proxy is set', () => {
      expect(getProxyDescription()).toBe('No proxy configured')
    })

    it('should describe HTTP proxy', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      expect(getProxyDescription()).toBe('HTTP: http://proxy.example.com:8080')
    })

    it('should describe HTTPS proxy', () => {
      process.env.HTTPS_PROXY = 'https://proxy.example.com:8080'
      expect(getProxyDescription()).toContain('HTTPS: https://proxy.example.com:8080')
    })

    it('should describe both HTTP and HTTPS proxies', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      process.env.HTTPS_PROXY = 'https://secure-proxy.example.com:8443'
      const description = getProxyDescription()
      expect(description).toContain('HTTP: http://proxy.example.com:8080')
      expect(description).toContain('HTTPS: https://secure-proxy.example.com:8443')
    })

    it('should include NO_PROXY in description', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      process.env.NO_PROXY = 'localhost,example.com'
      const description = getProxyDescription()
      expect(description).toContain('NO_PROXY: localhost,example.com')
    })

    it('should not duplicate when HTTP and HTTPS proxy are the same', () => {
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080'
      process.env.HTTPS_PROXY = 'http://proxy.example.com:8080'
      const description = getProxyDescription()
      expect(description).toBe('HTTP: http://proxy.example.com:8080')
    })
  })
})