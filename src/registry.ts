/**
 * Registry Data Manager
 * Handles loading, validation, and querying of server data
 */

import * as fs from 'fs';
import * as path from 'path';
import { MCPServer, ServersListResponse, ServerDetailResponse, PaginationInfo, SearchQuery } from './types';

export class RegistryDataManager {
  private servers: MCPServer[] = [];
  private dataPath: string;

  constructor(dataPath: string = './data') {
    this.dataPath = dataPath;
  }

  /**
   * Load server data from JSON files in the data directory
   */
  async loadServers(): Promise<void> {
    const serversPath = path.join(this.dataPath, 'servers');
    
    if (!fs.existsSync(serversPath)) {
      console.warn(`Servers directory not found: ${serversPath}`);
      return;
    }

    const files = fs.readdirSync(serversPath).filter(file => file.endsWith('.json'));
    
    this.servers = [];
    for (const file of files) {
      try {
        const filePath = path.join(serversPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const server: MCPServer = JSON.parse(content);
        
        // Generate ID if not provided
        if (!server.id) {
          server.id = this.generateServerId(server.name);
        }

        // Set timestamps if not provided
        const stats = fs.statSync(filePath);
        if (!server.created_at) {
          server.created_at = stats.birthtime.toISOString();
        }
        if (!server.updated_at) {
          server.updated_at = stats.mtime.toISOString();
        }

        this.servers.push(server);
      } catch (error) {
        console.error(`Error loading server from ${file}:`, error);
      }
    }

    console.log(`Loaded ${this.servers.length} servers`);
  }

  /**
   * Get paginated list of servers
   */
  getServersList(query: SearchQuery = {}): ServersListResponse {
    let filteredServers = [...this.servers];

    // Apply filters
    if (query.status) {
      filteredServers = filteredServers.filter(s => s.status === query.status);
    }

    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      filteredServers = filteredServers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) ||
        s.description.toLowerCase().includes(searchTerm) ||
        (s.keywords && s.keywords.some(k => k.toLowerCase().includes(searchTerm)))
      );
    }

    if (query.author) {
      filteredServers = filteredServers.filter(s => 
        s.author?.name?.toLowerCase().includes(query.author!.toLowerCase())
      );
    }

    // Apply sorting
    const sortBy = query.sort_by || 'updated_at';
    const sortOrder = query.sort_order || 'desc';
    
    filteredServers.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'created_at':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        case 'updated_at':
          aValue = a.updated_at;
          bValue = b.updated_at;
          break;
        default:
          aValue = a.updated_at;
          bValue = b.updated_at;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const page = Math.max(1, query.page || 1);
    const perPage = Math.min(100, Math.max(1, query.per_page || 20));
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    const paginatedServers = filteredServers.slice(startIndex, endIndex);
    
    const pagination: PaginationInfo = {
      page,
      per_page: perPage,
      total_count: filteredServers.length,
      total_pages: Math.ceil(filteredServers.length / perPage)
    };

    return {
      servers: paginatedServers,
      pagination
    };
  }

  /**
   * Get server by ID
   */
  getServerById(id: string): ServerDetailResponse | null {
    const server = this.servers.find(s => s.id === id);
    if (!server) {
      return null;
    }

    return { server };
  }

  /**
   * Get all servers (for internal use)
   */
  getAllServers(): MCPServer[] {
    return [...this.servers];
  }

  /**
   * Generate a unique server ID from the name
   */
  private generateServerId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-_.]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}