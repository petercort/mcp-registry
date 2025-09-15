import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ServerData, ServerDetail, Repository } from './types';

export class DataService {
  private servers: ServerDetail[] = [];
  private dataPath: string;

  constructor(dataPath: string = path.join(__dirname, '../data/servers')) {
    this.dataPath = dataPath;
    this.loadServers();
  }

  private loadServers(): void {
    try {
      const files = fs.readdirSync(this.dataPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      this.servers = jsonFiles.map(file => {
        const filePath = path.join(this.dataPath, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const serverData: ServerData = JSON.parse(rawData);
        
        return this.transformServerData(serverData);
      });

      console.log(`Loaded ${this.servers.length} servers from ${this.dataPath}`);
    } catch (error) {
      console.error('Error loading server data:', error);
      this.servers = [];
    }
  }

  private transformServerData(data: ServerData): ServerDetail {
    // Generate a UUID for the server if not present in _meta
    const serverId = data._meta?.['io.modelcontextprotocol.registry/official']?.id || uuidv4();
    
    // Transform repository string to Repository object if needed
    let repository: Repository | undefined;
    if (data.repository || data.homepage) {
      const repoUrl = data.repository || data.homepage!;
      repository = {
        url: repoUrl,
        source: this.extractSource(repoUrl),
        id: uuidv4()
      };
    }

    // Create the current timestamp for created_at and updated_at if not present
    const now = new Date().toISOString();
    const lastUpdated = data._meta?.['github.com/registry']?.last_updated || now;

    const serverDetail: ServerDetail = {
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

    return serverDetail;
  }

  private extractSource(url: string): string {
    if (url.includes('github.com')) return 'github';
    if (url.includes('gitlab.com')) return 'gitlab';
    if (url.includes('bitbucket.org')) return 'bitbucket';
    return 'other';
  }

  public getAllServers(): ServerDetail[] {
    return this.servers;
  }

  public getServerById(id: string): ServerDetail | undefined {
    return this.servers.find(server => 
      server._meta?.['io.modelcontextprotocol.registry/official']?.id === id
    );
  }

  public getServersPaginated(cursor?: string, limit: number = 50): {
    servers: ServerDetail[];
    nextCursor?: string;
    count: number;
  } {
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    
    const paginatedServers = this.servers.slice(startIndex, endIndex);
    const nextCursor = endIndex < this.servers.length ? endIndex.toString() : undefined;

    return {
      servers: paginatedServers,
      nextCursor,
      count: paginatedServers.length
    };
  }

  public reloadServers(): void {
    this.loadServers();
  }
}