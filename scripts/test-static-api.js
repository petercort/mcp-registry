const fs = require('fs');
const path = require('path');

class StaticApiTester {
  constructor() {
    this.distDir = path.join(__dirname, '../dist');
    this.errors = [];
    this.tests = 0;
    this.passed = 0;
  }

  test(description, testFn) {
    this.tests++;
    try {
      testFn();
      this.passed++;
      console.log(`✅ ${description}`);
    } catch (error) {
      this.errors.push(`❌ ${description}: ${error.message}`);
      console.log(`❌ ${description}: ${error.message}`);
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(this.distDir, filePath));
  }

  readJsonFile(filePath) {
    const content = fs.readFileSync(path.join(this.distDir, filePath), 'utf-8');
    return JSON.parse(content);
  }

  runTests() {
    console.log('🧪 Testing Static API Generation...\n');

    // Test health endpoints
    this.test('Health endpoint (health.json) exists', () => {
      if (!this.fileExists('health.json')) throw new Error('health.json not found');
    });

    this.test('Health endpoint (health) exists', () => {
      if (!this.fileExists('health')) throw new Error('health file not found');
    });

    this.test('Health endpoint contains valid data', () => {
      const health = this.readJsonFile('health.json');
      if (!health.status) throw new Error('Missing status');
      if (!health.timestamp) throw new Error('Missing timestamp');
      if (typeof health.servers_count !== 'number') throw new Error('Invalid servers_count');
    });

    // Test servers list endpoint
    this.test('Servers list endpoint exists', () => {
      if (!this.fileExists('v0/servers.json')) throw new Error('v0/servers.json not found');
    });

    this.test('Servers list contains valid data', () => {
      const serversList = this.readJsonFile('v0/servers.json');
      if (!Array.isArray(serversList.servers)) throw new Error('servers is not an array');
      if (!serversList.metadata) throw new Error('Missing metadata');
      if (typeof serversList.metadata.count !== 'number') throw new Error('Invalid count');
    });

    // Test individual server endpoints
    this.test('Individual server files exist', () => {
      const serversDir = path.join(this.distDir, 'v0/servers');
      if (!fs.existsSync(serversDir)) throw new Error('servers directory not found');
      
      const files = fs.readdirSync(serversDir);
      if (files.length === 0) throw new Error('No server files found');
      
      console.log(`    Found ${files.length} server files: ${files.join(', ')}`);
    });

    this.test('Individual server files contain valid data', () => {
      const serversList = this.readJsonFile('v0/servers.json');
      const firstServer = serversList.servers[0];
      
      const serverFile = this.readJsonFile(`v0/servers/${firstServer.id}.json`);
      if (!serverFile.name) throw new Error('Server file missing name');
      if (!serverFile.description) throw new Error('Server file missing description');
    });

    // Test API index
    this.test('API index exists', () => {
      if (!this.fileExists('index.json')) throw new Error('index.json not found');
    });

    this.test('API index contains valid data', () => {
      const apiIndex = this.readJsonFile('index.json');
      if (!apiIndex.endpoints) throw new Error('Missing endpoints');
      if (!apiIndex.servers_available) throw new Error('Missing servers_available');
    });

    // Test data consistency
    this.test('Data consistency between endpoints', () => {
      const serversList = this.readJsonFile('v0/servers.json');
      const apiIndex = this.readJsonFile('index.json');
      const health = this.readJsonFile('health.json');
      
      if (serversList.metadata.count !== apiIndex.servers_available.length) {
        throw new Error('Server count mismatch between endpoints');
      }
      
      if (serversList.metadata.count !== health.servers_count) {
        throw new Error('Server count mismatch with health endpoint');
      }
    });

    // Summary
    console.log(`\n📊 Test Results:`);
    console.log(`   Total tests: ${this.tests}`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.tests - this.passed}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
      process.exit(1);
    } else {
      console.log('\n🎉 All static API tests passed!');
      console.log('\n📡 Available endpoints:');
      console.log('   GET /health.json - Health check');
      console.log('   GET /v0/servers.json - List all servers'); 
      console.log('   GET /v0/servers/{id}.json - Individual server details');
      console.log('   GET /index.json - API information');
    }
  }
}

const tester = new StaticApiTester();
tester.runTests();