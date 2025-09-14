# Sample MCP Registry Data

This directory contains sample MCP server entries for demonstration purposes.

## Structure

- `servers/` - Directory containing individual server JSON files
- Each JSON file represents a single MCP server entry
- Server entries follow the MCP server schema specification

## Server Examples

### weather-server.json
- NPM-based weather data server
- Demonstrates package-based deployment
- Includes custom metadata for ratings and security scans

### file-manager.json  
- PyPI-based file management server
- Shows Python package deployment
- Includes comprehensive capability listing

### database-tools.json
- Git-based database tools server
- Demonstrates remote deployment method
- Shows security scanning results

### code-assistant.json
- NPM-based code analysis server
- Premium/featured server example
- High user ratings and downloads

### inactive-server.json
- Example of deprecated server status
- Shows lifecycle management

## Adding New Servers

To add a new server to the registry:

1. Create a new JSON file in the `servers/` directory
2. Follow the MCP server schema specification
3. Include required fields: name, description, status, version
4. Add either `packages` (for package registry deployment) or `remotes` (for git-based deployment)
5. Optionally include metadata in the `_meta` field

## Schema Validation

All server entries should validate against the official MCP server schema:
`https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json`

## Build Process

During the build process:
- Server JSON files are loaded and validated
- Unique IDs are generated if not provided
- Timestamps are added based on file modification times
- Static API endpoints are generated for GitHub Pages deployment