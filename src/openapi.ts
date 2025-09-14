/**
 * OpenAPI Specification Generator
 * Creates OpenAPI/Swagger documentation for the registry API
 */

export interface OpenAPISpec {
  openapi: string;
  info: any;
  servers?: any[];
  paths: any;
  components: any;
}

export class OpenAPIGenerator {
  generateSpec(baseUrl: string): OpenAPISpec {
    return {
      openapi: "3.0.3",
      info: {
        title: "MCP Registry API",
        description: "API for the Model Context Protocol server registry",
        version: "1.0.0",
        contact: {
          name: "Registry Maintainer",
          email: "maintainer@example.com",
          url: "https://github.com/your-username/mcp-registry"
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT"
        }
      },
      servers: [
        {
          url: baseUrl,
          description: "Production server"
        }
      ],
      paths: {
        "/v0/servers": {
          get: {
            summary: "List servers",
            description: "Get a paginated list of MCP servers",
            parameters: [
              {
                name: "page",
                in: "query",
                description: "Page number for pagination",
                required: false,
                schema: {
                  type: "integer",
                  minimum: 1,
                  default: 1
                }
              },
              {
                name: "per_page",
                in: "query", 
                description: "Number of results per page",
                required: false,
                schema: {
                  type: "integer",
                  minimum: 1,
                  maximum: 100,
                  default: 20
                }
              },
              {
                name: "status",
                in: "query",
                description: "Filter by server status",
                required: false,
                schema: {
                  type: "string",
                  enum: ["active", "inactive", "deleted", "pending"]
                }
              },
              {
                name: "q",
                in: "query",
                description: "Search query for name, description, or keywords",
                required: false,
                schema: {
                  type: "string"
                }
              },
              {
                name: "author",
                in: "query",
                description: "Filter by author name",
                required: false,
                schema: {
                  type: "string"
                }
              }
            ],
            responses: {
              "200": {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ServersListResponse"
                    }
                  }
                }
              },
              "400": {
                description: "Bad request",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ErrorResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/v0/servers/{id}": {
          get: {
            summary: "Get server details",
            description: "Get detailed information about a specific server",
            parameters: [
              {
                name: "id",
                in: "path",
                description: "Server ID",
                required: true,
                schema: {
                  type: "string"
                }
              }
            ],
            responses: {
              "200": {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ServerDetailResponse"
                    }
                  }
                }
              },
              "404": {
                description: "Server not found",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/ErrorResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/v0/info": {
          get: {
            summary: "Get registry info",
            description: "Get registry metadata and configuration",
            responses: {
              "200": {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/RegistryConfig"
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        schemas: {
          MCPServer: {
            type: "object",
            required: ["name", "description", "status", "version"],
            properties: {
              id: {
                type: "string",
                description: "Unique server identifier"
              },
              name: {
                type: "string",
                description: "Server name"
              },
              description: {
                type: "string",
                description: "Server description"
              },
              status: {
                type: "string",
                enum: ["active", "inactive", "deleted", "pending"],
                description: "Server status"
              },
              version: {
                type: "string",
                description: "Server version"
              },
              packages: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/PackageInfo"
                },
                description: "Package deployment information"
              },
              remotes: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/RemoteInfo"
                },
                description: "Remote repository information"
              },
              author: {
                $ref: "#/components/schemas/Author"
              },
              homepage: {
                type: "string",
                format: "uri",
                description: "Project homepage URL"
              },
              repository: {
                type: "string",
                format: "uri",
                description: "Source repository URL"
              },
              license: {
                type: "string",
                description: "License identifier"
              },
              keywords: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Search keywords"
              },
              capabilities: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "MCP capabilities provided"
              },
              created_at: {
                type: "string",
                format: "date-time",
                description: "Creation timestamp"
              },
              updated_at: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp"
              },
              _meta: {
                type: "object",
                description: "Custom metadata"
              }
            }
          },
          PackageInfo: {
            type: "object",
            required: ["registry_type", "identifier", "version"],
            properties: {
              registry_type: {
                type: "string",
                enum: ["npm", "pypi", "github", "docker"],
                description: "Package registry type"
              },
              identifier: {
                type: "string",
                description: "Package identifier"
              },
              version: {
                type: "string",
                description: "Package version"
              },
              repository_url: {
                type: "string",
                format: "uri",
                description: "Package repository URL"
              },
              download_url: {
                type: "string",
                format: "uri",
                description: "Direct download URL"
              }
            }
          },
          RemoteInfo: {
            type: "object",
            required: ["url"],
            properties: {
              url: {
                type: "string",
                format: "uri",
                description: "Repository URL"
              },
              ref: {
                type: "string",
                description: "Git reference (branch, tag, or commit)"
              },
              subpath: {
                type: "string",
                description: "Subdirectory path within repository"
              }
            }
          },
          Author: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
                description: "Author name"
              },
              email: {
                type: "string",
                format: "email",
                description: "Author email"
              },
              url: {
                type: "string",
                format: "uri",
                description: "Author URL"
              }
            }
          },
          PaginationInfo: {
            type: "object",
            required: ["page", "per_page", "total_count", "total_pages"],
            properties: {
              page: {
                type: "integer",
                description: "Current page number"
              },
              per_page: {
                type: "integer",
                description: "Results per page"
              },
              total_count: {
                type: "integer",
                description: "Total number of results"
              },
              total_pages: {
                type: "integer",
                description: "Total number of pages"
              }
            }
          },
          ServersListResponse: {
            type: "object",
            required: ["servers", "pagination"],
            properties: {
              servers: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/MCPServer"
                }
              },
              pagination: {
                $ref: "#/components/schemas/PaginationInfo"
              }
            }
          },
          ServerDetailResponse: {
            type: "object",
            required: ["server"],
            properties: {
              server: {
                $ref: "#/components/schemas/MCPServer"
              }
            }
          },
          RegistryConfig: {
            type: "object",
            required: ["name", "description", "version", "base_url", "api_version"],
            properties: {
              name: {
                type: "string",
                description: "Registry name"
              },
              description: {
                type: "string",
                description: "Registry description"
              },
              version: {
                type: "string",
                description: "Registry version"
              },
              base_url: {
                type: "string",
                format: "uri",
                description: "Base URL for the registry API"
              },
              api_version: {
                type: "string",
                description: "API version"
              }
            }
          },
          ErrorResponse: {
            type: "object",
            required: ["error"],
            properties: {
              error: {
                type: "object",
                required: ["code", "message"],
                properties: {
                  code: {
                    type: "string",
                    description: "Error code"
                  },
                  message: {
                    type: "string",
                    description: "Error message"
                  },
                  details: {
                    description: "Additional error details"
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  generateSwaggerUI(specUrl: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Registry API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '${specUrl}',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
  }
}