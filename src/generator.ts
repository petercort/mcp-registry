/**
 * Static Site Generator for MCP Registry
 * Generates static JSON and HTML files for GitHub Pages deployment
 */

import * as fs from 'fs';
import * as path from 'path';
import { RegistryDataManager } from './registry';
import { RegistryConfig, ErrorResponse } from './types';
import { OpenAPIGenerator } from './openapi';

export class StaticSiteGenerator {
  private registryManager: RegistryDataManager;
  private outputDir: string;
  private config: RegistryConfig;
  private openApiGenerator: OpenAPIGenerator;

  constructor(outputDir: string = './docs') {
    this.outputDir = outputDir;
    this.registryManager = new RegistryDataManager();
    this.openApiGenerator = new OpenAPIGenerator();
    this.config = {
      name: 'MCP Registry',
      description: 'A registry for Model Context Protocol servers',
      version: '1.0.0',
      base_url: 'https://your-username.github.io/mcp-registry',
      api_version: 'v0',
      contact: {
        name: 'Registry Maintainer',
        email: 'maintainer@example.com',
        url: 'https://github.com/your-username/mcp-registry'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    };
  }

  /**
   * Generate the complete static site
   */
  async generate(): Promise<void> {
    console.log('Starting static site generation...');

    // Ensure output directory exists
    this.ensureDirectoryExists(this.outputDir);

    // Load server data
    await this.registryManager.loadServers();

    // Generate API endpoints
    await this.generateApiEndpoints();

    // Generate HTML pages
    await this.generateHtmlPages();

    // Copy static assets
    await this.copyStaticAssets();

    console.log(`Static site generated successfully in ${this.outputDir}`);
  }

  /**
   * Generate API endpoint JSON files
   */
  private async generateApiEndpoints(): Promise<void> {
    const apiDir = path.join(this.outputDir, 'v0');
    this.ensureDirectoryExists(apiDir);

    // Generate servers list endpoint with pagination
    const maxPages = 10; // Limit for static generation
    for (let page = 1; page <= maxPages; page++) {
      const response = this.registryManager.getServersList({ page, per_page: 20 });
      
      if (response.servers.length === 0 && page > 1) {
        break; // No more pages
      }

      const filename = page === 1 ? 'servers.json' : `servers-page-${page}.json`;
      const filePath = path.join(apiDir, filename);
      
      fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
      console.log(`Generated ${filename}`);

      if (page >= response.pagination.total_pages) {
        break;
      }
    }

    // Generate individual server endpoints
    const serversDir = path.join(apiDir, 'servers');
    this.ensureDirectoryExists(serversDir);

    const allServers = this.registryManager.getAllServers();
    for (const server of allServers) {
      if (server.id) {
        const response = this.registryManager.getServerById(server.id);
        if (response) {
          const filePath = path.join(serversDir, `${server.id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
        }
      }
    }

    // Generate registry info endpoint
    const infoPath = path.join(apiDir, 'info.json');
    fs.writeFileSync(infoPath, JSON.stringify(this.config, null, 2));

    console.log(`Generated ${allServers.length} individual server endpoints`);
  }

  /**
   * Generate HTML pages
   */
  private async generateHtmlPages(): Promise<void> {
    // Generate index.html
    const indexHtml = this.generateIndexHtml();
    fs.writeFileSync(path.join(this.outputDir, 'index.html'), indexHtml);

    // Generate API documentation
    const docsHtml = this.generateDocsHtml();
    fs.writeFileSync(path.join(this.outputDir, 'docs.html'), docsHtml);

    // Generate OpenAPI specification
    const openApiSpec = this.openApiGenerator.generateSpec(this.config.base_url);
    fs.writeFileSync(path.join(this.outputDir, 'openapi.json'), JSON.stringify(openApiSpec, null, 2));

    // Generate Swagger UI
    const swaggerUi = this.openApiGenerator.generateSwaggerUI('./openapi.json');
    fs.writeFileSync(path.join(this.outputDir, 'api.html'), swaggerUi);

    console.log('Generated HTML pages and API documentation');
  }

  /**
   * Generate the main index.html page
   */
  private generateIndexHtml(): string {
    const servers = this.registryManager.getServersList({ per_page: 50 });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .header p {
            margin: 0;
            color: #666;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #007acc;
        }
        .servers-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .server-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-left: 4px solid #007acc;
        }
        .server-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .server-description {
            color: #666;
            margin-bottom: 15px;
        }
        .server-meta {
            font-size: 0.9em;
            color: #888;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-active {
            background: #e7f5e7;
            color: #2d5d2d;
        }
        .status-inactive {
            background: #fff3cd;
            color: #856404;
        }
        .nav {
            margin-bottom: 30px;
        }
        .nav a {
            color: #007acc;
            text-decoration: none;
            margin-right: 20px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${this.config.name}</h1>
        <p>${this.config.description}</p>
    </div>

    <div class="nav">
        <a href="/">Home</a>
        <a href="/docs.html">API Documentation</a>
        <a href="/api.html">Interactive API</a>
        <a href="/v0/servers.json">API</a>
    </div>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${servers.pagination.total_count}</div>
            <div>Total Servers</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${servers.servers.filter(s => s.status === 'active').length}</div>
            <div>Active Servers</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${this.config.api_version}</div>
            <div>API Version</div>
        </div>
    </div>

    <div class="servers-grid">
        ${servers.servers.map(server => `
            <div class="server-card">
                <div class="server-name">${server.name}</div>
                <div class="server-description">${server.description}</div>
                <div class="server-meta">
                    <span class="status-badge status-${server.status}">${server.status}</span>
                    <br>
                    Version: ${server.version}
                    ${server.author ? `<br>Author: ${server.author.name}` : ''}
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        // Simple client-side filtering could be added here
        console.log('MCP Registry loaded with ${servers.pagination.total_count} servers');
    </script>
</body>
</html>`;
  }

  /**
   * Generate API documentation page
   */
  private generateDocsHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation - ${this.config.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .endpoint {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .method {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
        }
        .path {
            font-family: monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
        }
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .nav {
            margin-bottom: 30px;
        }
        .nav a {
            color: #007acc;
            text-decoration: none;
            margin-right: 20px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>API Documentation</h1>
    
    <div class="nav">
        <a href="/">Home</a>
        <a href="/docs.html">API Documentation</a>
        <a href="/api.html">Interactive API</a>
        <a href="/v0/servers.json">API</a>
    </div>

    <h2>Base URL</h2>
    <p><code>${this.config.base_url}</code></p>

    <h2>Endpoints</h2>

    <div class="endpoint">
        <h3><span class="method">GET</span> <span class="path">/v0/servers</span></h3>
        <p>List all servers with pagination support.</p>
        
        <h4>Query Parameters</h4>
        <ul>
            <li><code>page</code> - Page number (default: 1)</li>
            <li><code>per_page</code> - Results per page (default: 20, max: 100)</li>
            <li><code>status</code> - Filter by status (active, inactive, deleted)</li>
            <li><code>q</code> - Search query</li>
        </ul>

        <h4>Example Response</h4>
        <pre><code>{
  "servers": [
    {
      "id": "example-server",
      "name": "Example Server",
      "description": "An example MCP server",
      "status": "active",
      "version": "1.0.0",
      "packages": [
        {
          "registry_type": "npm",
          "identifier": "example-mcp-server",
          "version": "1.0.0"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_count": 1,
    "total_pages": 1
  }
}</code></pre>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> <span class="path">/v0/servers/{id}</span></h3>
        <p>Get details for a specific server by ID.</p>

        <h4>Example Response</h4>
        <pre><code>{
  "server": {
    "id": "example-server",
    "name": "Example Server",
    "description": "An example MCP server",
    "status": "active",
    "version": "1.0.0",
    "packages": [
      {
        "registry_type": "npm",
        "identifier": "example-mcp-server",
        "version": "1.0.0"
      }
    ],
    "author": {
      "name": "Example Author",
      "email": "author@example.com"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}</code></pre>
    </div>

    <div class="endpoint">
        <h3><span class="method">GET</span> <span class="path">/v0/info</span></h3>
        <p>Get registry information and metadata.</p>

        <h4>Example Response</h4>
        <pre><code>{
  "name": "${this.config.name}",
  "description": "${this.config.description}",
  "version": "${this.config.version}",
  "base_url": "${this.config.base_url}",
  "api_version": "${this.config.api_version}"
}</code></pre>
    </div>
</body>
</html>`;
  }

  /**
   * Copy static assets (if any)
   */
  private async copyStaticAssets(): Promise<void> {
    // Create a simple favicon and robots.txt
    const faviconPath = path.join(this.outputDir, 'favicon.ico');
    const robotsPath = path.join(this.outputDir, 'robots.txt');

    // Create a minimal robots.txt
    fs.writeFileSync(robotsPath, `User-agent: *
Allow: /

Sitemap: ${this.config.base_url}/sitemap.xml`);

    console.log('Generated static assets');
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}