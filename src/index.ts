import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DataService } from './dataService';
import { ServerList } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize data service
const dataService = new DataService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// GET /v0/servers - List MCP servers
app.get('/v0/servers', (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string || '50', 10);

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const result = dataService.getServersPaginated(cursor, limit);

    const response: ServerList = {
      servers: result.servers,
      metadata: {
        count: result.count,
        ...(result.nextCursor && { next_cursor: result.nextCursor })
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in GET /v0/servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /v0/servers/{id} - Get MCP server details
app.get('/v0/servers/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const version = req.query.version as string | undefined;

    const server = dataService.getServerById(id);

    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // If a specific version is requested, we could filter here
    // For now, we'll just return the server as-is since we only have one version per server
    if (version && server.version !== version) {
      return res.status(404).json({ error: `Version ${version} not found for this server` });
    }

    res.json(server);
  } catch (error) {
    console.error('Error in GET /v0/servers/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /v0/publish endpoint (placeholder - not implemented for read-only registry)
app.post('/v0/publish', (req: Request, res: Response) => {
  res.status(501).json({ 
    error: 'Publishing is not implemented in this read-only registry' 
  });
});

// Catch-all for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Registry API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/v0`);
});