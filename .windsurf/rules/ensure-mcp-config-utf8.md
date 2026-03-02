---
description: Keep MCP config UTF-8 without BOM to avoid loading errors
trigger: model_decision
---

This rule prevents JSON errors that stop MCP servers from loading in Windsurf.

# Rule for MCP Config Encoding

Always save `%USERPROFILE%\.codeium\windsurf\mcp_config.json` as UTF-8 without BOM.

If BOM is present, run this PowerShell command to remove it:

```powershell
$mcpConfigPath = "$env:USERPROFILE\.codeium\windsurf\mcp_config.json"
if (Test-Path $mcpConfigPath) {
    try {
        $content = Get-Content $mcpConfigPath -Raw -ErrorAction Stop
        [System.IO.File]::WriteAllText($mcpConfigPath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "BOM removed successfully."
    } catch {
        Write-Host "Error removing BOM: $_"
    }
} else {
    Write-Host "MCP config file not found at $mcpConfigPath"
}
```

After running the command, restart the Windsurf editor for the MCP config to load properly.
