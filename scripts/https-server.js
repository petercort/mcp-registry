#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8443;
const DOCS_DIR = path.join(__dirname, '..', 'docs');

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf'
};

// Generate self-signed certificate if it doesn't exist
function generateSelfSignedCert() {
  const certPath = path.join(__dirname, '..', 'cert.pem');
  const keyPath = path.join(__dirname, '..', 'key.pem');
  
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('Generating self-signed certificate...');
    const { execSync } = require('child_process');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj '/CN=localhost'`, {
        stdio: 'inherit'
      });
      console.log('✅ Self-signed certificate generated');
    } catch (error) {
      console.error('❌ Failed to generate certificate. Please install OpenSSL or run: npm run generate-cert');
      process.exit(1);
    }
  }
  
  return {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };
}

// Create HTTPS server
function createServer() {
  let options;
  
  try {
    options = generateSelfSignedCert();
  } catch (error) {
    console.error('❌ Could not load SSL certificates:', error.message);
    console.log('💡 Try running: npm run generate-cert');
    process.exit(1);
  }

  const server = https.createServer(options, (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Default to index.html for root path
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Remove leading slash and resolve file path
    const filePath = path.join(DOCS_DIR, pathname.substring(1));
    const ext = path.extname(filePath);

    // Security check - prevent directory traversal
    if (!filePath.startsWith(DOCS_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Try with .html extension if not found
        const htmlPath = filePath + '.html';
        fs.access(htmlPath, fs.constants.F_OK, (err2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
              <!DOCTYPE html>
              <html>
                <head><title>404 Not Found</title></head>
                <body>
                  <h1>404 Not Found</h1>
                  <p>The requested resource ${pathname} was not found.</p>
                  <a href="/">← Back to home</a>
                </body>
              </html>
            `);
          } else {
            serveFile(res, htmlPath, '.html');
          }
        });
      } else {
        serveFile(res, filePath, ext);
      }
    });
  });

  return server;
}

function serveFile(res, filePath, ext) {
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }

    // Add security headers
    const headers = {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    res.writeHead(200, headers);
    res.end(content);
  });
}

// Start server
function startServer() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('❌ docs directory not found. Please run: npm run build');
    process.exit(1);
  }

  const server = createServer();
  
  server.listen(PORT, () => {
    console.log(`🚀 HTTPS Server running at https://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${DOCS_DIR}`);
    console.log('🔒 Using self-signed certificate (browser will show security warning)');
    console.log('💡 To stop server: Ctrl+C');
    console.log('');
    console.log('📖 Available URLs:');
    console.log(`   • Home: https://localhost:${PORT}/`);
    console.log(`   • API: https://localhost:${PORT}/v0/servers.json`);
    console.log(`   • Docs: https://localhost:${PORT}/docs.html`);
    console.log(`   • Interactive API: https://localhost:${PORT}/api.html`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down HTTPS server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

// Run if called directly
if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };