// Client-side MCP Registry API
class MCPRegistryAPI {
    constructor() {
        this.servers = [];
        this.baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    }

    async init() {
        await this.loadServers();
    }

    async loadServers() {
        try {
            console.log('🔍 Loading server index from:', window.location.origin + window.location.pathname);

            // First, load the dynamically generated server index
            let serverIndex = null;
            const indexPaths = [
                './servers-index.json',
                'servers-index.json',
                '../servers-index.json'
            ];

            for (const path of indexPaths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        serverIndex = await response.json();
                        console.log(`✅ Loaded server index from ${path} (${serverIndex.count} servers)`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }

            // Fallback to hardcoded list if index not found
            let serverFiles = [];
            if (serverIndex && serverIndex.files) {
                serverFiles = serverIndex.files.map(file => file.filename);
                console.log(`📋 Using dynamic server list: ${serverFiles.join(', ')}`);
            } else {
                // Fallback to hardcoded list
                console.warn('⚠️ Server index not found, using fallback list');
                serverFiles = [
                    'arxiv-mcp-server.json',
                    'exa-mcp-server.json', 
                    'excel-mcp-server.json',
                    'fetch-mcp.json',
                    'markdownify-mcp.json',
                    'mcp-playwright.json'
                ];
            }

            const loadPromises = serverFiles.map(async (file) => {
                try {
                    // Try multiple path variations to handle different deployment scenarios
                    const paths = [
                        `./data/servers/${file}`,
                        `data/servers/${file}`,
                        `../data/servers/${file}`
                    ];
                    
                    let response = null;
                    let lastError = null;
                    
                    for (const path of paths) {
                        try {
                            response = await fetch(path);
                            if (response.ok) {
                                console.log(`✅ Loaded ${file} from ${path}`);
                                break;
                            }
                        } catch (error) {
                            lastError = error;
                            continue;
                        }
                    }
                    
                    if (!response || !response.ok) {
                        throw new Error(`Failed to load ${file} from any path. Last error: ${lastError?.message || 'Unknown'}`);
                    }
                    
                    const data = await response.json();
                    return this.transformServerData(data);
                } catch (error) {
                    console.warn(`❌ Failed to load ${file}:`, error);
                    return null;
                }
            });

            const results = await Promise.all(loadPromises);
            this.servers = results.filter(server => server !== null);
            
            console.log(`✅ Successfully loaded ${this.servers.length} out of ${serverFiles.length} servers`);
            
            if (this.servers.length === 0) {
                console.error('❌ No servers were loaded! Check that data files are accessible.');
                console.log('Current location:', window.location.href);
                console.log('Expected data path:', new URL('./data/servers/', window.location.href).href);
            }
        } catch (error) {
            console.error('❌ Error loading servers:', error);
            throw error;
        }
    }

    transformServerData(data) {
        // Generate a UUID for the server if not present
        const serverId = data._meta?.['io.modelcontextprotocol.registry/official']?.id || this.generateUUID();
        
        // Transform repository string to Repository object if needed
        let repository;
        if (data.repository || data.homepage) {
            const repoUrl = data.repository || data.homepage;
            repository = {
                url: repoUrl,
                source: this.extractSource(repoUrl),
                id: this.generateUUID()
            };
        }

        // Create the current timestamp for created_at and updated_at if not present
        const now = new Date().toISOString();
        const lastUpdated = data._meta?.['github.com/registry']?.last_updated || now;

        return {
            $schema: data.$schema,
            name: data.name,
            description: data.description,
            status: data.status || 'active',
            repository,
            version: data.version,
            website_url: data.homepage,
            created_at: now,
            updated_at: lastUpdated,
            packages: data.packages || [],
            keywords: data.keywords || [],
            capabilities: data.capabilities || [],
            author: data.author,
            license: data.license,
            _meta: {
                ...data._meta,
                'io.modelcontextprotocol.registry/official': {
                    id: serverId,
                    published_at: now,
                    updated_at: lastUpdated,
                    is_latest: true,
                    ...data._meta?.['io.modelcontextprotocol.registry/official']
                }
            }
        };
    }

    extractSource(url) {
        if (url.includes('github.com')) return 'github';
        if (url.includes('gitlab.com')) return 'gitlab';
        if (url.includes('bitbucket.org')) return 'bitbucket';
        return 'other';
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // API Methods
    getAllServers() {
        return this.servers;
    }

    getServerById(id) {
        return this.servers.find(server => 
            server._meta?.['io.modelcontextprotocol.registry/official']?.id === id
        );
    }

    getServersPaginated(cursor = 0, limit = 50) {
        const startIndex = typeof cursor === 'string' ? parseInt(cursor, 10) : cursor;
        const endIndex = startIndex + limit;
        
        const paginatedServers = this.servers.slice(startIndex, endIndex);
        const nextCursor = endIndex < this.servers.length ? endIndex.toString() : undefined;

        return {
            servers: paginatedServers,
            metadata: {
                next_cursor: nextCursor,
                count: paginatedServers.length
            }
        };
    }

    // API Endpoint Simulation
    async simulateAPI(endpoint, params = {}) {
        switch (endpoint) {
            case '/api/v0/health':
                return {
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    servers_loaded: this.servers.length
                };

            case '/api/v0/servers':
                const cursor = params.cursor;
                const limit = Math.min(parseInt(params.limit) || 50, 100);
                return this.getServersPaginated(cursor, limit);

            case '/api/v0/servers/:id':
                const server = this.getServerById(params.id);
                if (!server) {
                    throw new Error('Server not found');
                }
                return server;

            default:
                throw new Error('Endpoint not found');
        }
    }
}

// Global API instance
window.MCPRegistry = new MCPRegistryAPI();

// Add API endpoint handlers for direct access
window.addEventListener('DOMContentLoaded', () => {
    // Intercept fetch requests to our API endpoints
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        const urlObj = new URL(url, window.location.origin);
        
        // Check if this is an API request to our endpoints
        if (urlObj.pathname.startsWith('/api/v0/')) {
            return new Promise(async (resolve, reject) => {
                try {
                    let result;
                    const params = Object.fromEntries(urlObj.searchParams);
                    
                    if (urlObj.pathname === '/api/v0/health') {
                        result = await MCPRegistry.simulateAPI('/api/v0/health');
                    } else if (urlObj.pathname === '/api/v0/servers') {
                        result = await MCPRegistry.simulateAPI('/api/v0/servers', params);
                    } else if (urlObj.pathname.match(/^\/api\/v0\/servers\/([^\/]+)$/)) {
                        const id = urlObj.pathname.split('/').pop();
                        result = await MCPRegistry.simulateAPI('/api/v0/servers/:id', { id, ...params });
                    } else {
                        throw new Error('Endpoint not found');
                    }

                    resolve({
                        ok: true,
                        status: 200,
                        json: async () => result,
                        text: async () => JSON.stringify(result, null, 2)
                    });
                } catch (error) {
                    resolve({
                        ok: false,
                        status: error.message === 'Server not found' ? 404 : 500,
                        json: async () => ({ error: error.message }),
                        text: async () => JSON.stringify({ error: error.message })
                    });
                }
            });
        }
        
        // For non-API requests, use original fetch
        return originalFetch.apply(this, arguments);
    };
});