#!/usr/bin/env node

/**
 * Build Verification Script
 * 
 * Ensures the built dist/index.html is production-ready by checking:
 * 1. The file exists
 * 2. It does not reference development-only paths like /src/main.tsx
 * 3. It references bundled assets from /assets/
 * 
 * Exits with non-zero status if verification fails, preventing broken deploys.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const distIndexPath = join(projectRoot, 'dist', 'index.html');

console.log('🔍 Verifying production build...');

// Check if dist/index.html exists
if (!existsSync(distIndexPath)) {
  console.error('❌ ERROR: dist/index.html does not exist!');
  console.error('   Make sure the build completed successfully.');
  process.exit(1);
}

// Read the built HTML
const html = readFileSync(distIndexPath, 'utf-8');

// Check for development-only references
const devPatterns = [
  { pattern: /\/src\/main\.tsx/, name: 'development entrypoint /src/main.tsx' },
  { pattern: /\/src\//, name: 'source file references /src/' },
];

let hasErrors = false;

for (const { pattern, name } of devPatterns) {
  if (pattern.test(html)) {
    console.error(`❌ ERROR: dist/index.html contains ${name}`);
    console.error('   This indicates the build did not complete correctly.');
    hasErrors = true;
  }
}

// Check for production asset references
const hasAssetReferences = /\/assets\//.test(html) || /<script[^>]*type="module"[^>]*>/i.test(html);

if (!hasAssetReferences) {
  console.warn('⚠️  WARNING: dist/index.html does not appear to reference bundled assets.');
  console.warn('   This may indicate an incomplete build.');
}

if (hasErrors) {
  console.error('\n❌ Build verification FAILED!');
  console.error('   The built HTML is not production-ready.');
  console.error('   Please check your build configuration and try again.');
  process.exit(1);
}

console.log('✅ Build verification passed!');
console.log('   dist/index.html is production-ready.');
process.exit(0);
