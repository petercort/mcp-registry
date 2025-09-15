#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing MCP Registry Static Site...\n');

try {
  // Check if static site was built
  const distPath = './dist';
  if (!fs.existsSync(distPath)) {
    console.log('❌ dist/ directory not found! Run "npm run build:static" first.');
    process.exit(1);
  }

  // Check required files
  const requiredFiles = [
    'index.html',
    'api.js', 
    'api-test.html',
    '404.html',
    'servers-index.json'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
    console.log(`✅ Found: ${file}`);
  }

  // Check data directory
  const dataPath = path.join(distPath, 'data', 'servers');
  if (!fs.existsSync(dataPath)) {
    console.log('❌ data/servers directory not found!');
    process.exit(1);
  }

  // Check JSON files
  const jsonFiles = fs.readdirSync(dataPath).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.log('❌ No JSON server files found in data/servers!');
    process.exit(1);
  }

  console.log(`✅ Found ${jsonFiles.length} server JSON files`);

  // Validate JSON files
  let validServers = 0;
  for (const file of jsonFiles) {
    try {
      const filePath = path.join(dataPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Basic validation
      if (!data.name || !data.description || !data.version) {
        console.log(`❌ Invalid server data in ${file}: missing required fields`);
        process.exit(1);
      }
      
      validServers++;
    } catch (error) {
      console.log(`❌ Error parsing ${file}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log(`✅ Validated ${validServers} server files`);

  // Check that index.html contains expected content
  const indexPath = path.join(distPath, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  if (!indexContent.includes('MCP Server Registry')) {
    console.log('❌ index.html missing expected content');
    process.exit(1);
  }
  
  if (!indexContent.includes('api.js')) {
    console.log('❌ index.html not referencing api.js');
    process.exit(1);
  }

  console.log('✅ index.html contains expected content');

  // Check server index
  const indexPath = path.join(distPath, 'servers-index.json');
  const indexContent = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  
  if (indexContent.count !== jsonFiles.length) {
    console.log(`❌ Server index count mismatch: expected ${jsonFiles.length}, got ${indexContent.count}`);
    process.exit(1);
  }
  
  console.log(`✅ Server index valid (${indexContent.count} servers, generated: ${indexContent.generated})`);

  // Sample server data from first file
  const firstFile = jsonFiles[0];
  const firstServerPath = path.join(dataPath, firstFile);
  const firstServer = JSON.parse(fs.readFileSync(firstServerPath, 'utf-8'));
  
  console.log('\n📄 Sample server data:');
  console.log(`   File: ${firstFile}`);
  console.log(`   Name: ${firstServer.name}`);
  console.log(`   Description: ${firstServer.description}`);
  console.log(`   Version: ${firstServer.version}`);
  console.log(`   Status: ${firstServer.status || 'active'}`);
  console.log(`   Packages: ${firstServer.packages?.length || 0}`);

  console.log('\n🎉 All tests passed! The static site is ready for deployment.');
  console.log('\n📋 Available pages:');
  console.log('   📊 Main Dashboard: index.html');
  console.log('   🧪 API Tester: api-test.html');
  console.log('   🚫 404 Page: 404.html');
  console.log('\n🚀 Deploy with: npm run serve:static');
  
} catch (error) {
  console.error('❌ Error testing static site:', error.message);
  process.exit(1);
}