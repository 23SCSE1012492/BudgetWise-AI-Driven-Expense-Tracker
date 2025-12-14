<#
Simple packaging script for the Finance Tracker backend.
Usage:
  PowerShell (Windows PowerShell 5.1):
    .\package-backend.ps1
    .\package-backend.ps1 -Source .\backend -Destination .\backend.zip

This creates `backend.zip` containing the `backend/` folder.
#>
param(
    [string]$Source = ".\backend",
    [string]$Destination = ".\backend.zip"
)

if (-not (Test-Path $Source)) {
    Write-Error "Source folder '$Source' not found."
    exit 1
}

try {
    if (Test-Path $Destination) {
        Remove-Item $Destination -Force
    }

    Write-Output "Creating zip '$Destination' from folder '$Source'..."
    Compress-Archive -Path $Source -DestinationPath $Destination -Force
    Write-Output "Created $Destination"
} catch {
    Write-Error "Packaging failed: $_"
    exit 1
}
