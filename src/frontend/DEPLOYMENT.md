# Deployment Guide

## Production Build Requirements

This application requires a proper production build to function correctly. The development `index.html` references source files that are not available in production.

### Critical: Development vs Production HTML

- **Development** (`frontend/index.html`): References `/src/main.tsx` - used only by Vite dev server
- **Production** (`dist/index.html`): References bundled assets in `/assets/` - created by build process

**⚠️ WARNING**: Never serve `frontend/index.html` directly in production. Always build first and serve from `dist/`.

## Build Verification

A verification script (`scripts/verify-dist-index.mjs`) runs after each build to ensure:
- `dist/index.html` exists
- No references to `/src/main.tsx` or other source files
- Proper references to bundled assets

If verification fails, the build will exit with an error, preventing broken deployments.

## Deployment Configurations

### Internet Computer (ICP)

**Configuration**: `.ic-assets.json5`

The asset canister is configured to:
- Serve all files from the `dist/` directory
- Prevent caching of HTML files (max_age: 0)
- Cache immutable assets (JS/CSS/images) for 1 year
- Ignore source files to prevent accidental serving

**Deploy**:
