# Development Scripts

This folder contains utility scripts for development, debugging, and testing the WANKR application.

## Scripts

### Handle Resolution Scripts
- **`test-handle-resolution.js`** - Test basic handle resolution functionality
- **`test-farcaster-resolution.js`** - Test Farcaster handle resolution specifically
- **`test-bulk-farcaster.js`** - Test bulk Farcaster API calls
- **`test-batching-system.js`** - Test the batching system for handle resolution
- **`test-priority-system.js`** - Test the priority system for handle resolution

### Fix Scripts
- **`fix-shame-feed-resolution.js`** - Script to fix shame feed handle resolution issues

## Usage

All scripts require the server to be built first:

```bash
npm run build:server
```

Then run any script:

```bash
node scripts/test-handle-resolution.js
```

## Notes

- These scripts are for development/debugging purposes
- They test the compiled JavaScript in the `dist/` folder
- Make sure your `.env.local` file is configured with the necessary API keys
- The server should be running on port 3001 for some scripts to work properly
