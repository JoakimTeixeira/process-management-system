---
description: Auto-update AGENTS.md when repository structure changes
trigger: model_decision
---

This rule ensures the AGENTS.md file stays synchronized with the actual repository structure, including all subdirectory changes up to 3 levels deep, with clean, non-repetitive formatting.

# Rule for AGENTS.md Auto-Update

When directories are added/removed from repository root OR when subdirectory structures change (up to 3 levels deep), update the Directory Structure section in AGENTS.md with the following formatting rules:

1. **Root level folders**: Use full path (e.g., `docs/`, `.windsurf/`)
2. **Child folders**: Use only the folder name without parent path (e.g., `images/`, `google-docs-mcp-setup/`)
3. **Descriptions**: Keep concise and avoid repeating folder names in descriptions
4. **No path repetition**: Child folders should not include parent paths

## PowerShell Script

```powershell
$repoPath = "c:\Users\joka\Documents\process-management-system"
$agentsMdPath = Join-Path $repoPath "AGENTS.md"

Write-Host "Repository structure (up to 3 levels deep):"

# Level 1 - Root directories
$rootDirs = Get-ChildItem -Path $repoPath -Directory |
    Where-Object { $_.Name -ne ".git" } | Sort-Object Name | Select-Object -ExpandProperty Name
Write-Host "Level 1: $($rootDirs -join ', ')"

# Level 2 - First level subdirectories
Write-Host "Level 2:"
foreach ($dir in $rootDirs) {
    $path = Join-Path $repoPath $dir
    if (Test-Path $path) {
        $subDirs = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name | Select-Object -ExpandProperty Name
        if ($subDirs.Count -gt 0) {
            Write-Host "  $dir`: $($subDirs -join ', ')"
        }
    }
}

# Level 3 - Second level subdirectories
Write-Host "Level 3:"
foreach ($dir in $rootDirs) {
    $path = Join-Path $repoPath $dir
    if (Test-Path $path) {
        $subDirs = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name | Select-Object -ExpandProperty Name
        foreach ($subDir in $subDirs) {
            $subPath = Join-Path $path $subDir
            $level3Dirs = Get-ChildItem -Path $subPath -Directory -ErrorAction SilentlyContinue |
                Sort-Object Name | Select-Object -ExpandProperty Name
            if ($level3Dirs.Count -gt 0) {
                Write-Host "    $dir/$subDir`: $($level3Dirs -join ', ')"
            }
        }
    }
}

Write-Host "Update AGENTS.md with clean formatting: root folders use full paths, child folders use names only, no path repetition"
```
