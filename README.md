# MCP Registry

A TypeScript-based static site generator for hosting Model Context Protocol (MCP) server registries on GitHub Pages.

## Overview

This project provides a complete solution for creating and hosting an MCP registry that:

- ✅ Compiles TypeScript to generate static JSON APIs
- ✅ Deploys automatically to GitHub Pages
- ✅ Provides a web interface for browsing servers
- ✅ Includes interactive API documentation
- ✅ Supports pagination and search functionality
- ✅ Validates server entries against MCP schema

## Features

### 🚀 Static Site Generation
- Generates static JSON files for API endpoints
- Creates HTML interface for browsing servers
- Builds OpenAPI specification and Swagger UI
- Optimized for GitHub Pages deployment

### 📊 API Endpoints
- `GET /v0/servers` - Paginated list of servers with filtering
- `GET /v0/servers/{id}` - Individual server details
- `GET /v0/info` - Registry metadata
- Full OpenAPI 3.0 specification at `/openapi.json`

### 🔍 Search & Filter
- Full-text search across names, descriptions, and keywords
- Filter by status (active, inactive, deleted)
- Filter by author
- Pagination support (up to 100 results per page)

### 📖 Documentation
- Interactive API documentation with Swagger UI
- Complete OpenAPI specification
- Example server entries included

## Quick Start

### 1. Clone and Setup

\`\`\`bash
git clone <your-repo-url>
cd mcp-registry
npm install
\`\`\`

### 2. Add Your Servers

Create JSON files in the \`data/servers/\` directory following the MCP server schema:

\`\`\`json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "your-server-name",
  "description": "Description of your MCP server",
  "status": "active",
  "version": "1.0.0",
  "packages": [
    {
      "registry_type": "npm",
      "identifier": "your-package-name",
      "version": "1.0.0"
    }
  ],
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "keywords": ["mcp", "tools", "api"]
}
\`\`\`

### 3. Build and Test Locally

\`\`\`bash
# Build the static site
npm run build

# Serve locally with HTTP (requires Python 3)
npm run serve

# Serve locally with HTTPS (requires Node.js and OpenSSL)
npm run serve:node

# Visit http://localhost:8000 (HTTP) or https://localhost:8443 (HTTPS)
\`\`\`

#### HTTPS Development

For HTTPS development (recommended for testing API integrations):

\`\`\`bash
# Generate self-signed certificate (one-time setup)
npm run generate-cert

# Start HTTPS server
npm run serve:node
\`\`\`

**Note**: Self-signed certificates will show a security warning in browsers. This is normal for local development.

### 4. Deploy to GitHub Pages

1. Update the \`base_url\` in \`src/generator.ts\` to match your GitHub Pages URL
2. Push to your main branch
3. GitHub Actions will automatically build and deploy

## Project Structure

\`\`\`
mcp-registry/
├── src/                     # TypeScript source code
│   ├── types.ts            # Type definitions
│   ├── registry.ts         # Data management
│   ├── generator.ts        # Static site generator
│   ├── openapi.ts         # API documentation
│   ├── cli.ts             # CLI runner
│   └── index.ts           # Main exports
├── data/                   # Server data
│   └── servers/           # Individual server JSON files
├── docs/                  # Generated static site (auto-generated)
├── .github/workflows/     # GitHub Actions
└── package.json          # Dependencies and scripts
\`\`\`

## Configuration

### Registry Settings

Edit the \`config\` object in \`src/generator.ts\`:

\`\`\`typescript
this.config = {
  name: 'Your Registry Name',
  description: 'Description of your registry',
  version: '1.0.0',
  base_url: 'https://your-username.github.io/your-repo',
  api_version: 'v0'
};
\`\`\`

### GitHub Pages Setup

1. Go to your repository Settings > Pages
2. Select "GitHub Actions" as the source
3. The workflow will automatically deploy on pushes to main

## API Usage

### List All Servers

\`\`\`bash
curl "https://your-username.github.io/mcp-registry/v0/servers"
\`\`\`

### Search Servers

\`\`\`bash
curl "https://your-username.github.io/mcp-registry/v0/servers?q=weather&status=active"
\`\`\`

### Get Server Details

\`\`\`bash
curl "https://your-username.github.io/mcp-registry/v0/servers/weather-server"
\`\`\`

## Development

### Scripts

- \`npm run build\` - Build TypeScript and generate static site
- \`npm run dev\` - Watch TypeScript files for changes
- \`npm run clean\` - Clean build artifacts
- \`npm run serve\` - Serve site locally
- \`npm run type-check\` - TypeScript type checking

### Adding Features

1. **Custom Metadata**: Add fields to the \`_meta\` section of server entries
2. **New Endpoints**: Extend the \`StaticSiteGenerator\` class
3. **UI Enhancements**: Modify the HTML generation methods
4. **Search Improvements**: Update the filtering logic in \`RegistryDataManager\`

## Server Schema

Server entries must follow the MCP server schema. Required fields:

- \`name\` - Unique server name
- \`description\` - Server description  
- \`status\` - One of: active, inactive, deleted, pending
- \`version\` - Semantic version string
- \`packages\` OR \`remotes\` - Deployment information

Optional fields include \`author\`, \`homepage\`, \`repository\`, \`license\`, \`keywords\`, \`capabilities\`, and \`_meta\`.

## Examples

The \`data/servers/\` directory contains example servers demonstrating:

- NPM package deployment (\`weather-server.json\`)
- PyPI package deployment (\`file-manager.json\`) 
- Git repository deployment (\`database-tools.json\`)
- Custom metadata usage (\`code-assistant.json\`)
- Inactive server status (\`inactive-server.json\`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your server entries or improvements
4. Submit a pull request

## License

MIT - see LICENSE file for details.

## Related

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/)
- [MCP Server Schema](https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json)
