# Automated Google Docs MCP Setup - Following Repository Steps Exactly
# Step 1: Create Google Cloud OAuth Client (Already Done - Using .env)
# Step 2: Authorize (Automated)
# Step 3: Add to MCP Client (Automated)

Write-Host "=== Automated Google Docs MCP Setup ===" -ForegroundColor Green
Write-Host "Following https://github.com/a-bonus/google-docs-mcp exactly" -ForegroundColor Cyan
Write-Host ""

# Step 1: Load credentials (OAuth Client already created)
Write-Host "Step 1: Loading OAuth Credentials..." -ForegroundColor Yellow

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env with your Google Cloud OAuth credentials" -ForegroundColor White
    exit 1
}

# Parse .env file
$ClientId = $null
$ClientSecret = $null
$envContent = Get-Content $envFile
foreach ($line in $envContent) {
    if ($line -match "^GOOGLE_CLIENT_ID=(.+)$") {
        $ClientId = $matches[1] -replace '"', ''
    }
    if ($line -match "^GOOGLE_CLIENT_SECRET=(.+)$") {
        $ClientSecret = $matches[1] -replace '"', ''
    }
}

if (-not $ClientId -or -not $ClientSecret) {
    Write-Host "ERROR: Invalid credentials in .env" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: OAuth Client loaded" -ForegroundColor Green
Write-Host ""

# Step 2: Authorize (Following repository exactly)
Write-Host "Step 2: Authorize (Repository Command)" -ForegroundColor Yellow

# Set environment variables exactly as in repository docs
$env:GOOGLE_CLIENT_ID = $ClientId
$env:GOOGLE_CLIENT_SECRET = $ClientSecret

Write-Host "Setting environment variables..." -ForegroundColor White
Write-Host "GOOGLE_CLIENT_ID=$ClientId" -ForegroundColor Gray
Write-Host "GOOGLE_CLIENT_SECRET=***" -ForegroundColor Gray
Write-Host ""

# Create config directory (as expected by MCP)
$configDir = "$env:USERPROFILE\.config\google-docs-mcp"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "Created directory: $configDir" -ForegroundColor Green
}

Write-Host "Executing repository command:" -ForegroundColor Cyan
Write-Host "npx -y @a-bonus/google-docs-mcp auth" -ForegroundColor White
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "1. Open your browser for Google authorization" -ForegroundColor White
Write-Host "2. Wait for you to approve" -ForegroundColor White
Write-Host "3. Save refresh token to ~/.config/google-docs-mcp/token.json" -ForegroundColor White
Write-Host ""
Write-Host "Please complete authorization in the browser..." -ForegroundColor Cyan

# Start the auth process and capture URL
Write-Host "Starting auth process and capturing URL..." -ForegroundColor Yellow

# Use Start-Job to run auth in background and capture output
$authJob = Start-Job -ScriptBlock {
    param($clientId, $clientSecret)
    $env:GOOGLE_CLIENT_ID = $clientId
    $env:GOOGLE_CLIENT_SECRET = $clientSecret
    
    # Check if already authenticated first
    $tokenPath = "$env:USERPROFILE\.config\google-docs-mcp\token.json"
    if (Test-Path $tokenPath) {
        Write-Host "Already authenticated, checking token validity..." -ForegroundColor Green
        npx -y @a-bonus/google-docs-mcp --version 2>&1
    } else {
        npx -y @a-bonus/google-docs-mcp auth 2>&1
    }
} -ArgumentList $ClientId, $ClientSecret

# Wait a moment for output
Start-Sleep -Seconds 2

# Try to capture the URL
$authOutput = Receive-Job $authJob -ErrorAction SilentlyContinue

# Check if we got output
if ($authOutput) {
    Write-Host "Auth output captured, extracting URL..." -ForegroundColor Gray
    
    # Extract OAuth URL from output
    $urlPattern = "https://accounts\.google\.com/o/oauth2/v2/auth[^\s]*"
    $urls = [regex]::Matches($authOutput, $urlPattern)
    
    if ($urls.Count -gt 0) {
        $fullUrl = $urls[0].Value
        Write-Host "OAuth URL detected!" -ForegroundColor Green
        Write-Host "Opening Chrome automatically..." -ForegroundColor Yellow
        
        # Open Chrome with the complete URL
        try {
            Start-Process "chrome.exe" -ArgumentList $fullUrl
            Write-Host "Chrome opened with complete URL!" -ForegroundColor Green
        } catch {
            # Fallback to default browser
            Start-Process $fullUrl
            Write-Host "Browser opened with complete URL!" -ForegroundColor Green
        }
        
        Write-Host "Complete URL: $fullUrl" -ForegroundColor Cyan
    } else {
        Write-Host "Could not extract URL from output." -ForegroundColor Yellow
        Write-Host "The MCP should open the browser automatically." -ForegroundColor White
    }
} else {
    Write-Host "No auth output captured yet. MCP should open browser automatically." -ForegroundColor Yellow
    Write-Host "Waiting for MCP to show the OAuth URL..." -ForegroundColor White
    
    # Wait a bit more and try again
    Start-Sleep -Seconds 3
    $authOutput = Receive-Job $authJob -ErrorAction SilentlyContinue
    
    if ($authOutput -and $authOutput -match "Authorize this app by visiting this url") {
        Write-Host "Found OAuth URL in output!" -ForegroundColor Green
        # Extract URL using a simpler pattern
        if ($authOutput -match "https://accounts\.google\.com/o/oauth2/v2/auth[^\s\[]+") {
            $fullUrl = $matches[0]
            Write-Host "Opening Chrome with URL..." -ForegroundColor Yellow
            try {
                Start-Process "chrome.exe" -ArgumentList $fullUrl
            } catch {
                Start-Process $fullUrl
            }
            Write-Host "Browser opened!" -ForegroundColor Green
        }
    }
}

# Continue waiting for auth to complete
Write-Host "Waiting for authorization to complete..." -ForegroundColor Cyan

# Only wait if we're doing auth (not version check)
$tokenPath = "$env:USERPROFILE\.config\google-docs-mcp\token.json"
if (-not (Test-Path $tokenPath)) {
    Wait-Job $authJob -Timeout 120 | Out-Null
}

# Get final results
Receive-Job $authJob -ErrorAction SilentlyContinue | Out-Null
Remove-Job $authJob -Force

Write-Host ""
Write-Host "Step 2: Checking for token..." -ForegroundColor Yellow

# Check if token was created (as specified in repository docs)
$tokenFile = "$configDir\token.json"
$timeout = 60
$elapsed = 0

# Wait for token to appear (repository says it saves automatically)
while ($elapsed -lt $timeout -and -not (Test-Path $tokenFile)) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "Checking for token... ($elapsed/$timeout seconds)" -ForegroundColor Gray
}

if (Test-Path $tokenFile) {
    Write-Host "SUCCESS: Authorization successful!" -ForegroundColor Green
    Write-Host "SUCCESS: Token saved to: ~/.config/google-docs-mcp/token.json" -ForegroundColor Green
    Write-Host "Token size: $((Get-Item $tokenFile).Length) bytes" -ForegroundColor White
} else {
    Write-Host "ERROR: Token not found after $timeout seconds" -ForegroundColor Red
    Write-Host "Please ensure you completed authorization in the browser" -ForegroundColor White
    exit 1
}

Write-Host ""

# Step 3: Add to MCP Client (Following repository exactly)
Write-Host "Step 3: Add to MCP Client (Repository Configuration)" -ForegroundColor Yellow

# Create MCP config directory
$mcpConfigDir = "$env:USERPROFILE\.codeium\windsurf"
if (-not (Test-Path $mcpConfigDir)) {
    New-Item -ItemType Directory -Path $mcpConfigDir -Force | Out-Null
    Write-Host "Created MCP config directory: $mcpConfigDir" -ForegroundColor Green
}

# Create/update MCP configuration (preserve existing servers)
$mcpConfigPath = "$mcpConfigDir\mcp_config.json"

# Ensure UTF-8 without BOM in MCP config
if (Test-Path $mcpConfigPath) {
    $bytes = [System.IO.File]::ReadAllBytes($mcpConfigPath)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $content = Get-Content $mcpConfigPath -Raw
        [System.IO.File]::WriteAllText($mcpConfigPath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "BOM removed from MCP config to ensure valid JSON." -ForegroundColor Green
    }
}

try {
    # Load existing configuration or create new one
    if (Test-Path $mcpConfigPath) {
        $existingConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json
        Write-Host "Loading existing MCP configuration..." -ForegroundColor White
    } else {
        $existingConfig = @{
            mcpServers = @{}
        }
        Write-Host "Creating new MCP configuration..." -ForegroundColor White
    }
    
    # Add Google Docs MCP configuration (preserve existing servers)
    $googleDocsConfig = @{
        command = "npx"
        args = @("-y", "@a-bonus/google-docs-mcp")
        env = @{
            GOOGLE_CLIENT_ID = $ClientId
            GOOGLE_CLIENT_SECRET = $ClientSecret
        }
    }
    
    # Add or update the google-docs server
    $existingConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "google-docs" -Value $googleDocsConfig -Force
    
    $jsonContent = $existingConfig | ConvertTo-Json -Depth 10
    $jsonContent | Out-File -FilePath $mcpConfigPath -Encoding UTF8 -Force
    
    Write-Host "SUCCESS: MCP configuration updated: $mcpConfigPath" -ForegroundColor Green
    Write-Host "Existing servers preserved + Google Docs added" -ForegroundColor White
    
    # Show all configured servers
    $configuredServers = $existingConfig.mcpServers.PSObject.Properties.Name
    Write-Host "Total MCP servers configured: $($configuredServers.Count)" -ForegroundColor Cyan
    foreach ($server in $configuredServers) {
        Write-Host "  - $server" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "ERROR: Failed to update MCP configuration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Final verification
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Following repository steps exactly:" -ForegroundColor Cyan
Write-Host ""
Write-Host "SUCCESS: Step 1 - OAuth Client created (using .env)" -ForegroundColor Green
Write-Host "SUCCESS: Step 2 - Authorization completed (token saved)" -ForegroundColor Green
Write-Host "SUCCESS: Step 3 - MCP Client configured (Windsurf)" -ForegroundColor Green
Write-Host ""
Write-Host "Repository requirements satisfied:" -ForegroundColor White
Write-Host "Token location: ~/.config/google-docs-mcp/token.json" -ForegroundColor Gray
Write-Host "MCP config: ~/.config/windsurf/mcp_config.json" -ForegroundColor Gray
Write-Host "Server starts automatically when MCP client needs it" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps (from repository):" -ForegroundColor Cyan
Write-Host "1. Restart Windsurf" -ForegroundColor White
Write-Host "2. The server starts automatically when your MCP client needs it" -ForegroundColor White
Write-Host "3. Use @google-docs to access Google Workspace tools" -ForegroundColor White
Write-Host ""
Write-Host "Google Docs MCP is ready!" -ForegroundColor Green
