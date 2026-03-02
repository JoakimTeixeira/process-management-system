---
description: Install and configure Google Docs MCP Server for Windsurf on Windows machines
---

# Google Docs MCP Setup Skill for Windows

## Overview

This skill provides step-by-step instructions to install and configure the Google Docs MCP Server for Windsurf on Windows machines, enabling full access to Google Docs, Sheets, and Drive.

**Repository**: https://github.com/a-bonus/google-docs-mcp

## Prerequisites

- Windows 10/11
- Internet connection
- Google account
- Node.js (for npx command)

## Installation Steps

### 1. Install Node.js (if not already installed)

```powershell
winget install OpenJS.NodeJS
```

### 2. Create Google Cloud OAuth Client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Docs API, Google Sheets API, and Google Drive API
4. Configure the OAuth consent screen (External, add your email as a test user)
5. Create an OAuth client ID (Desktop app type)
6. Copy the Client ID and Client Secret from the confirmation screen

### 2.1. Create .env File for Script

For the automated script, create a `.env` file in the same directory as the script:

```env
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

**Note**: Replace the values with your actual OAuth credentials from Google Cloud Console.

### 3. Authorize the MCP Server

```powershell
$env:GOOGLE_CLIENT_ID="your-client-id"
$env:GOOGLE_CLIENT_SECRET="your-client-secret"
npx -y @a-bonus/google-docs-mcp auth
```

This opens your browser for Google authorization. After you approve, the refresh token is saved to `~/.config/google-docs-mcp/token.json`.

### 4. Configure Windsurf MCP

Create or update the MCP configuration file at `%APPDATA%\Codeium\windsurf\mcp_config.json`:

```json
{
  "mcpServers": {
    "google-docs": {
      "command": "npx",
      "args": ["-y", "@a-bonus/google-docs-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id",
        "GOOGLE_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### 5. Verify Installation

```powershell
# Test the MCP server directly
npx -y @a-bonus/google-docs-mcp --help

# Check token file exists
Test-Path "$env:USERPROFILE\.config\google-docs-mcp\token.json"
```

## Automation Script

### One-Click Setup Script

Use the provided `script.ps1` script for automated installation:

```powershell
# Run the full setup (requires .env file with OAuth credentials)
.\script.ps1

# Skip Node.js installation (if already installed)
.\script.ps1 -SkipNodeJS

# Skip authentication (do manually later)
.\script.ps1 -SkipAuth
```

**Important**: The script requires a `.env` file in the same directory with your Google Cloud OAuth credentials. The script handles Node.js installation, OAuth authorization, and MCP configuration automatically with error handling and verification.

## What Can It Do?

### Google Docs

- Create, read, update, and delete documents
- Full text editing and formatting
- Insert images, tables, and links
- Manage comments and suggestions

### Google Sheets

- Create, read, update, and delete spreadsheets
- Cell operations and formulas
- Range operations and formatting
- Chart management

### Google Drive

- List, search, and manage files
- Upload and download files
- Folder operations
- File sharing and permissions

## Troubleshooting

### Common Issues and Solutions

1. **Node.js not found**
   - Install Node.js using the provided command
   - Restart PowerShell after installation

2. **Google Cloud OAuth setup fails**
   - Ensure all required APIs are enabled (Docs, Sheets, Drive)
   - Make sure you added your email as a test user
   - Verify OAuth consent screen is properly configured

3. **Authentication fails**
   - Check that Client ID and Client Secret are correct
   - Ensure browser cookies are enabled
   - Try running the auth command again

4. **MCP server not working in Windsurf**
   - Restart Windsurf after configuration
   - Verify the JSON syntax in `mcp_config.json`
   - Check that the environment variables are set correctly

5. **Token issues**
   - Delete `~/.config/google-docs-mcp/token.json` and re-authenticate
   - Ensure the token file has proper permissions

## Usage in Windsurf

After installation and restart:

1. Use `@google-docs` to toggle MCP tools
2. Access Google Docs, Sheets, and Drive tools for document management
3. Tools include: document creation, editing, formatting, file management, and more

## File Locations

- **Node.js**: `$env:PROGRAMFILES\nodejs\`
- **MCP Config**: `%APPDATA%\Codeium\windsurf\mcp_config.json`
- **Auth Token**: `$env:USERPROFILE\.config\google-docs-mcp\token.json`
- **Script .env**: `.\.env` (same directory as script.ps1)
- **Google Cloud Console**: https://console.cloud.google.com/

## Security Notes

- Store your Client ID and Client Secret securely in the `.env` file
- Never commit the `.env` file to version control
- The MCP server has full access to your Google Docs, Sheets, and Drive
- Use a dedicated Google account for testing if possible
- Regularly review authorized applications in your Google Account settings

## Notes

- This MCP server provides comprehensive access to Google Workspace documents
- Use responsibly and be aware of the permissions granted
- The server starts automatically when Windsurf needs it
- Disable the MCP server when not in use to preserve context window
