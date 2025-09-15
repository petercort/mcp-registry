# MCP Registry 

A static website for the Model Context Protocol (MCP) Server Registry that can be hosted on GitHub Pages, Netlify, Vercel, or any static hosting service.

## 🚀 Live Demo

- **Main Site**: [Your GitHub Pages URL]
- **API Tester**: [Your GitHub Pages URL]/api-test.html

## ✨ Features

- **📊 Interactive Dashboard** - Browse and search MCP servers
- **🔍 Server Discovery** - Search by name, description, or keywords  
- **📈 Statistics** - View registry statistics and metrics
- **🧪 API Testing** - Interactive API endpoint testing
- **📱 Responsive Design** - Works on desktop and mobile
- **⚡ Fast Loading** - Static site with client-side data loading

## 🎯 API Endpoints

The site simulates a REST API that can be accessed client-side:

### Health Check
```
GET /api/v0/health
```

### List Servers
```
GET /api/v0/servers?cursor={cursor}&limit={limit}
```

### Get Server Details  
```
GET /api/v0/servers/{id}?version={version}
```

## 🏗️ Building and Deployment

### GitHub Pages (Recommended)

1. **Enable GitHub Pages** in your repository settings
2. **Push to main branch** - the GitHub Actions workflow will automatically build and deploy

### Local Development

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd mcp-registry
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the static site**:
```bash
npm run build:static
```

4. **Serve locally**:
```bash
npm run serve:static
```

The site will be available at `http://localhost:8000`

### Manual Deployment

1. **Build the static site**:
```bash
npm run build:static
```

2. **Deploy the `dist/` folder** to your static hosting service:
   - **Netlify**: Drag and drop the `dist` folder
   - **Vercel**: Deploy from GitHub or upload `dist` folder  
   - **S3/CloudFront**: Upload `dist` contents to S3 bucket

## 📂 Project Structure

```
├── public/                 # Static site source files
│   ├── index.html         # Main dashboard page
│   ├── api-test.html      # API testing page
│   └── api.js             # Client-side API implementation
├── data/                  # Server registry data
│   └── servers/           # JSON files for each server
├── dist/                  # Built static site (generated)
├── .github/workflows/     # GitHub Actions for deployment
└── package.json           # Build scripts and dependencies
```

## 🔧 Adding New Servers

1. **Create a JSON file** in `data/servers/` following the schema
2. **Update the server list** in `public/api.js` (add filename to `serverFiles` array)
3. **Commit and push** - GitHub Actions will rebuild the site

### Server JSON Schema

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "your.domain/server-name",
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
    "email": "your@email.com",
    "url": "https://github.com/yourusername"
  },
  "homepage": "https://github.com/yourusername/your-server",
  "license": "MIT",
  "keywords": ["mcp", "server", "keywords"],
  "capabilities": ["tools"]
}
```

## 🚀 GitHub Actions Workflow

The repository includes automatic deployment to GitHub Pages:

- **Triggers**: Push to `main` or `registry-update-1` branches
- **Actions**: Build static site and deploy to GitHub Pages
- **Artifacts**: Built site available for download

## 🌐 Browser Compatibility

- ✅ Chrome/Edge 80+
- ✅ Firefox 75+  
- ✅ Safari 13+
- ✅ Mobile browsers

## 📄 API Compliance

This static implementation provides the same API interface as defined in the MCP Server Registry OpenAPI specification (version 2025-07-09), but runs entirely client-side without requiring a server.

## 🔒 Security

- No server required - purely static files
- CORS-friendly - can be embedded in other sites
- No sensitive data exposure - all data is public

## 🤝 Contributing

1. Fork the repository
2. Add your server JSON file to `data/servers/`
3. Update the server list in `public/api.js` 
4. Submit a pull request

## 📊 Current Registry

The registry currently includes:

- **6 MCP Servers** across various domains
- **Multiple Package Types** (npm, PyPI, etc.)
- **Active Maintenance** with regular updates