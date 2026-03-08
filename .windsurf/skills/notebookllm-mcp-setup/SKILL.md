---
description: Install and configure notebooklm-mcp-cli for Windsurf on Windows machines
---

# NotebookLM MCP CLI Setup Skill for Windows

## Overview

This skill provides step-by-step instructions to install and configure notebooklm-mcp-cli for Windsurf on Windows machines.

**Repository**: https://github.com/jacob-bd/notebooklm-mcp-cli

## Prerequisites

- Windows 10/11
- Internet connection
- Google account for NotebookLM authentication

## Installation Steps

### 1. Install Python 3.12

```powershell
winget install Python.Python.3.12
```

### 2. Install notebooklm-mcp-cli package

Add Python Scripts to Windows PATH environment variable to simplify all commands:

```powershell
# Add Python Scripts to Windows PATH environment variable
$pythonScripts = "$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pythonScripts", "User")

# Restart PowerShell or run this to refresh PATH in current session
$env:Path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")

# Now you can use simplified commands:
pip install notebooklm-mcp-cli
nlm setup add windsurf
nlm login
nlm doctor
```

### 3. Configure MCP server for Windsurf

**Use the repository's recommended automatic setup:**

```powershell
nlm setup add windsurf
```

This will automatically configure the MCP server for Windsurf by updating the configuration file at `%APPDATA%\Codeium\windsurf\mcp_config.json`.

**Alternative: Manual configuration**

If automatic setup fails, you can manually configure the MCP server:

```powershell
# Create MCP config directory
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.codeium\windsurf"

# Create/update MCP configuration
$mcpConfig = @{
    mcpServers = @{
        "notebooklm-mcp" = @{
            command = "notebooklm-mcp"
            args = @()
        }
    }
}

$mcpConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath "$env:USERPROFILE\.codeium\windsurf\mcp_config.json" -Encoding UTF8
```

### 4. Authenticate with NotebookLM

```powershell
nlm login
```

This will:

- Launch Chrome for authentication
- Extract cookies automatically
- Save credentials to `~\.notebooklm-mcp-cli\profiles\default`

### 5. Verify Installation

```powershell
# Test CLI
nlm notebook list

# Test MCP server
notebooklm-mcp.exe --help

# Run diagnostics
nlm doctor
```

## Automation Script

### One-Click Setup Script

Use the provided `script.ps1` script for automated installation:

```powershell
# Run the full setup
.\script.ps1

# Skip Python installation (if already installed)
.\script.ps1 -SkipPython

# Skip authentication (do manually later)
.\script.ps1 -SkipAuth
```

The script handles all steps automatically with error handling and verification.

## Troubleshooting

### Common Issues and Solutions

1. **Python not found in PATH**
   - Use full paths as shown in steps
   - Add Python to PATH manually if needed
   - Check with: `python --version` and `pip --version`

2. **Authentication fails**
   - Ensure Chrome is installed
   - Check that you're logged into Google in Chrome
   - Try running `nlm login` again
   - Close existing Chrome processes before retrying

3. **MCP server not working in Windsurf**
   - Restart Windsurf after configuration
   - Verify the JSON syntax in `mcp_config.json`
   - Check that the executable path is correct
   - Ensure UTF-8 encoding without BOM in config file

4. **Permission issues**
   - Run PowerShell as Administrator
   - Check antivirus isn't blocking the installation

5. **Unicode encoding errors in verification**
   - The script now handles Unicode issues automatically
   - If errors persist, run `nlm doctor` manually
   - Use `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` in PowerShell

6. **Only one MCP shows in Windsurf**
   - Check if other MCP configurations were overwritten
   - Verify all MCP servers are in `mcp_config.json`
   - Re-run setup scripts to restore missing configurations

7. **Chrome authentication issues**
   - Close all Chrome processes before running `nlm login`
   - Ensure Chrome is your default browser
   - Check that Google cookies are enabled

8. **PATH issues after installation**
   - Restart PowerShell to refresh PATH
   - Manually add Python Scripts to PATH: `$env:Path += ";$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts"`

## Usage in Windsurf

After installation and restart:

1. Use `@notebooklm-mcp` to toggle MCP tools
2. Access 29 NotebookLM tools for research and content creation
3. Tools include: notebook management, source addition, queries, research, and more

## File Locations

- **Python**: `$env:USERPROFILE\AppData\Local\Programs\Python\Python312\`
- **MCP Config**: `%APPDATA%\Codeium\windsurf\mcp_config.json`
- **Auth Data**: `$env:USERPROFILE\.notebooklm-mcp-cli\profiles\default`
- **Scripts**: `$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts\`

## Notes

- This setup uses internal NotebookLM APIs that may change without notice
- Use for personal/experimental purposes only
- The MCP provides 29 tools - disable when not using to preserve context window
- Authentication requires browser cookie extraction (automated by the tool)
