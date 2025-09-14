/**
 * MCP Registry Server Types
 * Based on the MCP registry specification
 */

export type ServerStatus = 'active' | 'inactive' | 'deleted' | 'pending';

export interface PackageInfo {
  registry_type: 'npm' | 'pypi' | 'github' | 'docker';
  identifier: string;
  version: string;
  repository_url?: string;
  download_url?: string;
}

export interface RemoteInfo {
  url: string;
  ref?: string;
  subpath?: string;
}

export interface ServerMetadata {
  [key: string]: any;
}

export interface MCPServer {
  $schema?: string;
  id?: string;
  name: string;
  description: string;
  status: ServerStatus;
  version: string;
  packages?: PackageInfo[];
  remotes?: RemoteInfo[];
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  capabilities?: string[];
  created_at?: string;
  updated_at?: string;
  _meta?: ServerMetadata;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface ServersListResponse {
  servers: MCPServer[];
  pagination: PaginationInfo;
}

export interface ServerDetailResponse {
  server: MCPServer;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface RegistryConfig {
  name: string;
  description: string;
  version: string;
  base_url: string;
  api_version: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface SearchQuery {
  q?: string;
  category?: string;
  author?: string;
  status?: ServerStatus;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
}