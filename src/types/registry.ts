export interface Repository {
  url: string;
  source: string;
  id?: string;
  subfolder?: string;
}

export interface Icon {
  src: string;
  mimeType?: "image/png" | "image/jpeg" | "image/jpg" | "image/svg+xml" | "image/webp";
  sizes?: string[];
  theme?: "light" | "dark";
}

export interface KeyValueInput {
  name: string;
  description?: string;
  isRequired?: boolean;
  format?: "string" | "number" | "boolean" | "filepath";
  value?: string;
  isSecret?: boolean;
  default?: string;
  placeholder?: string;
  choices?: string[];
  variables?: Record<string, Input>;
}

export interface Input {
  description?: string;
  isRequired?: boolean;
  format?: "string" | "number" | "boolean" | "filepath";
  value?: string;
  isSecret?: boolean;
  default?: string;
  placeholder?: string;
  choices?: string[];
}

export interface PositionalArgument extends Input {
  type: "positional";
  valueHint?: string;
  isRepeated?: boolean;
  variables?: Record<string, Input>;
}

export interface NamedArgument extends Input {
  type: "named";
  name: string;
  isRepeated?: boolean;
  variables?: Record<string, Input>;
}

export type Argument = PositionalArgument | NamedArgument;

export interface TransportBase {
  headers?: KeyValueInput[];
}

export interface StdioTransport {
  type: "stdio";
}

export interface StreamableHttpTransport extends TransportBase {
  type: "streamable-http";
  url: string;
}

export interface SseTransport extends TransportBase {
  type: "sse";
  url: string;
}

export type Transport = StdioTransport | StreamableHttpTransport | SseTransport;

export interface Package {
  registryType: string;
  registryBaseUrl?: string;
  identifier: string;
  version?: string;
  fileSha256?: string;
  runtimeHint?: string;
  transport: Transport;
  runtimeArguments?: Argument[];
  packageArguments?: Argument[];
  environmentVariables?: KeyValueInput[];
}

export interface ServerDetail {
  name: string;
  description: string;
  title?: string;
  repository?: Repository;
  version: string;
  websiteUrl?: string;
  icons?: Icon[];
  $schema?: string;
  packages?: Package[];
  remotes?: Transport[];
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export type RegistryStatus = "active" | "deprecated" | "deleted";

export interface RegistryOfficialMetadata {
  status: RegistryStatus;
  publishedAt: string;
  updatedAt: string;
  isLatest: boolean;
}

export interface RegistryMetadata {
  "io.modelcontextprotocol.registry/official"?: RegistryOfficialMetadata;
  [key: string]: unknown;
}

export interface ServerResponse {
  server: ServerDetail;
  _meta: RegistryMetadata;
}

export interface ServerListMetadata {
  nextCursor?: string | null;
  count?: number;
}

export interface ServerList {
  servers: ServerResponse[];
  metadata?: ServerListMetadata;
}

export interface PublishResult {
  response: ServerResponse;
  created: boolean;
}

