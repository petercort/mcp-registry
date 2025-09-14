/**
 * Main entry point for the MCP Registry static site generator
 */

import { StaticSiteGenerator } from './generator';

async function main() {
  try {
    const generator = new StaticSiteGenerator('./docs');
    await generator.generate();
    console.log('✅ Static site generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating static site:', error);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
  }
}

// Run the generator
if (typeof require !== 'undefined' && require.main === module) {
  main();
}

export { StaticSiteGenerator } from './generator';
export { RegistryDataManager } from './registry';
export * from './types';