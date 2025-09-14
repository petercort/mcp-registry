#!/usr/bin/env node
/**
 * CLI runner for the MCP Registry static site generator
 */

import { StaticSiteGenerator } from './generator';

async function main() {
  try {
    const generator = new StaticSiteGenerator('./docs');
    await generator.generate();
    console.log('✅ Static site generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating static site:', error);
    process.exit(1);
  }
}

main();