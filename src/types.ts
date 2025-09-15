// Types based on the OpenAPI specification
export interface Repository {
  url: string;
  source: string;
  id: string;
  subfolder?: string;
}

export interface Package {
  registry_type: string;
  registry_base_url?: string;
  identifier: string;
  version: string;
  file_sha256?: string;
  runtime_hint?: string;
  runtime_arguments?: Argument[];
  package_arguments?: Argument[];
  environment_variables?: KeyValueInput[];
}

export interface Input {
  description?: string;
  is_required?: boolean;
  format?: 'string' | 'number' | 'boolean' | 'filepath';
  value?: string;
  is_secret?: boolean;
  default?: string;
  choices?: string[];
}

export interface InputWithVariables extends Input {
  variables?: Record<string, Input>;
}

export interface PositionalArgument extends InputWithVariables {
  type: 'positional';
  value_hint?: string;
  is_repeated?: boolean;
}

export interface NamedArgument extends InputWithVariables {
  type: 'named';
  name: string;
  is_repeated?: boolean;
}

export interface KeyValueInput extends InputWithVariables {
  name: string;
}

export type Argument = PositionalArgument | NamedArgument;

export interface Remote {
  transport_type: 'streamable' | 'sse';
  url: string;
  headers?: KeyValueInput[];
}

export interface Server {
  name: string;
  description: string;
  status?: 'active' | 'deprecated';
  repository?: Repository;
  version: string;
  website_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServerDetail extends Server {
  $schema?: string;
  packages?: Package[];
  remotes?: Remote[];
  _meta?: {
    'io.modelcontextprotocol.registry/publisher-provided'?: any;
    'io.modelcontextprotocol.registry/official'?: {
      id: string;
      published_at: string;
      updated_at: string;
      is_latest: boolean;
    };
    [key: string]: any;
  };
}

export interface ServerList {
  servers: ServerDetail[];
  metadata?: {
    next_cursor?: string;
    count?: number;
  };
}

// Extended types for the actual server data structure we have
export interface ServerData {
  $schema: string;
  name: string;
  description: string;
  status: 'active' | 'deprecated';
  version: string;
  packages: Package[];
  author?: {
    name: string;
    email: string;
    url: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  capabilities?: string[];
  _meta?: Record<string, any>;
}