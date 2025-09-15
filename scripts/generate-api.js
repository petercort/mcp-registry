const fs = require('fs');
const path = require('path');

class StaticApiGenerator {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/servers');
    this.outputDir = path.join(__dirname, '../dist');
    this.servers = [];
  }

  loadServerData() {
    console.log('Loading server data...');
    
    if (!fs.existsSync(this.dataDir)) {
      throw new Error(`Data directory not found: ${this.dataDir}`);
    }

    const files = fs.readdirSync(this.dataDir)
      .filter(file => file.endsWith('.json'));

    this.servers = files.map(file => {
      const filePath = path.join(this.dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const serverData = JSON.parse(content);
      
      // Generate ID from filename if not present
      if (!serverData.id) {
        serverData.id = path.basename(file, '.json');
      }
      
      return serverData;
    });

    console.log(`Loaded ${this.servers.length} servers`);
  }

  generateServersList() {
    console.log('Generating /v0/servers endpoint...');
    
    // Create v0 directory
    const v0Dir = path.join(this.outputDir, 'v0');
    if (!fs.existsSync(v0Dir)) {
      fs.mkdirSync(v0Dir, { recursive: true });
    }

    // Generate main servers list
    const serversList = {
      servers: this.servers.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description,
        version: server.version || '1.0.0',
        author: server.author,
        homepage: server.homepage,
        repository: server.repository,
        license: server.license,
        keywords: server.keywords || [],
        // Include basic config info but not sensitive details
        sourceType: server.sourceType,
        ...(server.npmPackage && { npmPackage: server.npmPackage }),
        ...(server.githubRepo && { githubRepo: server.githubRepo })
      })),
      metadata: {
        count: this.servers.length,
        generated: new Date().toISOString()
      }
    };

    // Write servers.json
    fs.writeFileSync(
      path.join(v0Dir, 'servers.json'),
      JSON.stringify(serversList, null, 2)
    );

    console.log(`Generated servers list with ${serversList.servers.length} servers`);
  }

  generateIndividualServers() {
    console.log('Generating individual server endpoints...');
    
    const serversDir = path.join(this.outputDir, 'v0', 'servers');
    if (!fs.existsSync(serversDir)) {
      fs.mkdirSync(serversDir, { recursive: true });
    }

    this.servers.forEach(server => {
      const serverPath = path.join(serversDir, `${server.id}.json`);
      fs.writeFileSync(serverPath, JSON.stringify(server, null, 2));
    });

    console.log(`Generated ${this.servers.length} individual server files`);
  }

  generateHealthCheck() {
    console.log('Generating health check endpoint...');
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      servers_count: this.servers.length
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'health.json'),
      JSON.stringify(health, null, 2)
    );

    fs.writeFileSync(
      path.join(this.outputDir, 'health'),
      JSON.stringify(health, null, 2)
    );
  }

  generateIndex() {
    console.log('Generating API index...');
    
    const apiIndex = {
      name: 'MCP Registry API',
      version: '1.0.0',
      description: 'Static API for Model Context Protocol (MCP) Server Registry',
      endpoints: {
        health: '/health',
        servers: '/v0/servers',
        server_detail: '/v0/servers/{id}.json'
      },
      servers_available: this.servers.map(s => s.id),
      generated: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'index.json'),
      JSON.stringify(apiIndex, null, 2)
    );
  }

  generate() {
    console.log('🚀 Starting static API generation...');
    
    try {
      this.loadServerData();
      this.generateServersList();
      this.generateIndividualServers();
      this.generateHealthCheck();
      this.generateIndex();
      
      console.log('✅ Static API generation completed successfully!');
      console.log('\nGenerated endpoints:');
      console.log('  /health - Health check');
      console.log('  /v0/servers - List all servers');
      console.log('  /v0/servers/{id}.json - Individual server details');
      console.log('  /index.json - API information');
      
    } catch (error) {
      console.error('❌ Error generating static API:', error.message);
      process.exit(1);
    }
  }
}

// Run the generator
if (require.main === module) {
  const generator = new StaticApiGenerator();
  generator.generate();
}

module.exports = StaticApiGenerator;