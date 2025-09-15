#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Generating server index...');

try {
  const serversDir = path.join(__dirname, '..', 'data', 'servers');
  const outputPath = path.join(__dirname, '..', 'public', 'servers-index.json');
  
  // Read all JSON files in the servers directory
  const files = fs.readdirSync(serversDir)
    .filter(file => file.endsWith('.json'))
    .sort();
  
  console.log(`📁 Found ${files.length} server files:`);
  files.forEach(file => console.log(`   - ${file}`));
  
  // Create index with file metadata
  const serverIndex = {
    generated: new Date().toISOString(),
    count: files.length,
    files: files.map(file => {
      const filePath = path.join(serversDir, file);
      const stats = fs.statSync(filePath);
      
      // Read the JSON to get basic info
      let serverInfo = {};
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        serverInfo = {
          name: data.name,
          description: data.description,
          version: data.version,
          status: data.status || 'active'
        };
      } catch (error) {
        console.warn(`⚠️  Could not parse ${file}:`, error.message);
      }
      
      return {
        filename: file,
        path: `data/servers/${file}`,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        ...serverInfo
      };
    })
  };
  
  // Write the index file
  fs.writeFileSync(outputPath, JSON.stringify(serverIndex, null, 2));
  
  console.log(`✅ Generated server index at ${outputPath}`);
  console.log(`📊 Index contains ${serverIndex.count} servers`);
  
} catch (error) {
  console.error('❌ Error generating server index:', error);
  process.exit(1);
}