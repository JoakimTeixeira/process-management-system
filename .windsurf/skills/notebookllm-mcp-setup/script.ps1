# NotebookLM MCP CLI Setup Script for Windows
# This script automates the installation and configuration of notebooklm-mcp-cli for Windsurf

param(
    [switch]$SkipPython,
    [switch]$SkipAuth
)

Write-Host "Starting NotebookLM MCP CLI setup..." -ForegroundColor Green

# Step 1: Install Python (if not skipped)
if (-not $SkipPython) {
    Write-Host "Step 1: Installing Python 3.12..." -ForegroundColor Yellow
    try {
        winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
        Write-Host "Python installation completed." -ForegroundColor Green
    } catch {
        Write-Host "Failed to install Python. Please install manually." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Skipping Python installation..." -ForegroundColor Yellow
}

# Step 2: Add Python Scripts to PATH (Option A - Recommended)
Write-Host "Step 2: Adding Python Scripts to PATH..." -ForegroundColor Yellow

$pythonScriptsPath = "$env:USERPROFILE\AppData\Local\Programs\Python\Python312\Scripts"

try {
    # Add to user PATH environment variable
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pythonScriptsPath", "User")
    
    # Refresh PATH in current session
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    Write-Host "Python Scripts added to PATH. You can now use simplified commands." -ForegroundColor Green
} catch {
    Write-Host "Failed to add to PATH. Will use full paths instead." -ForegroundColor Yellow
}

# Step 3: Install notebooklm-mcp-cli
Write-Host "Step 3: Installing notebooklm-mcp-cli..." -ForegroundColor Yellow
try {
    pip install notebooklm-mcp-cli
    Write-Host "notebooklm-mcp-cli installation completed." -ForegroundColor Green
} catch {
    Write-Host "Failed to install notebooklm-mcp-cli." -ForegroundColor Red
    exit 1
}

# Step 4: Configure Windsurf (Using repository's automatic setup)
Write-Host "Step 4: Configuring Windsurf MCP using repository's automatic setup..." -ForegroundColor Yellow
try {
    Write-Host "Running: nlm setup add windsurf" -ForegroundColor Cyan
    nlm setup add windsurf
    Write-Host "SUCCESS: Windsurf configured automatically by nlm setup" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to configure Windsurf: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Authentication (if not skipped)
if (-not $SkipAuth) {
    Write-Host "Step 5: Authenticating with NotebookLM..." -ForegroundColor Yellow
    Write-Host "Attempting to open Chrome for authentication..." -ForegroundColor Cyan

    # Close existing Chrome processes
    Write-Host "Closing existing Chrome processes..." -ForegroundColor Yellow
    Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    Write-Host "Opening Chrome for NotebookLM authentication..." -ForegroundColor Green
    Write-Host "If Chrome opens, complete the login process there." -ForegroundColor Cyan
    Write-Host "Script will wait for authentication to complete..." -ForegroundColor Yellow

    try {
        # This will open Chrome and block until authentication is complete
        nlm login
        Write-Host "Authentication completed successfully." -ForegroundColor Green
    } catch {
        Write-Host "Authentication failed or Chrome crashed." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please complete authentication manually and press Enter to continue..." -ForegroundColor Cyan
        Read-Host "Press Enter when authentication is complete"
    }

    Write-Host "" -ForegroundColor White
    Write-Host "Proceeding to verification..." -ForegroundColor Green
    
    Write-Host "Authentication step completed. Proceeding to verification..." -ForegroundColor Green

} else {
    Write-Host "Skipping authentication." -ForegroundColor Yellow
}

# Step 6: Verification
Write-Host "Step 6: Verifying installation..." -ForegroundColor Yellow
try {
    nlm doctor
    Write-Host "Verification completed." -ForegroundColor Green
} catch {
    Write-Host "Verification failed. Check the error messages above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Summary ===" -ForegroundColor Cyan
Write-Host "Python Scripts added to PATH: $pythonScriptsPath" -ForegroundColor White
Write-Host "You can now use simplified commands:" -ForegroundColor Green
Write-Host "  pip install <package>" -ForegroundColor White
Write-Host "  nlm setup add <client>" -ForegroundColor White
Write-Host "  nlm login" -ForegroundColor White
Write-Host "  nlm doctor" -ForegroundColor White
Write-Host ""
Write-Host "Setup complete! Please restart Windsurf to activate the MCP server." -ForegroundColor Green
Write-Host "Use the @notebooklm-mcp command in Windsurf to toggle the MCP tools." -ForegroundColor Cyan
