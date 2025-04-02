# Simple bot simulation script in PowerShell

# Setup logging
$logDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force
}

# Log function
function Write-Log {
    param (
        [string]$Level,
        [string]$Message
    )

    $timestamp = Get-Date -Format "o"
    $logEntry = "[$timestamp] $($Level.ToUpper()): $Message"

    # Write to console
    Write-Host $logEntry

    # Write to log file
    Add-Content -Path (Join-Path $logDir "bot.log") -Value "$logEntry`n"
}

# Log startup
Write-Log -Level "info" -Message "Bot is starting up"
Write-Log -Level "info" -Message "Bot is now online and ready"

# Register event handler for script termination
$null = Register-EngineEvent -SourceIdentifier ([System.Management.Automation.PsEngineEvent]::Exiting) -Action {
    Write-Log -Level "info" -Message "Bot is shutting down"
}

try {
    # Infinite loop to keep script running
    while ($true) {
        # Generate some random activity logs for demonstration
        $activities = @(
            'Processed user command',
            'New member joined server',
            'Message moderation action taken',
            'Music playback started',
            'Poll created',
            'Weather information requested'
        )

        # Randomly log activity (30% chance)
        if ((Get-Random -Minimum 1 -Maximum 100) -gt 70) {
            $activity = $activities[(Get-Random -Minimum 0 -Maximum $activities.Count)]
            $levels = @('info', 'debug')
            $level = $levels[(Get-Random -Minimum 0 -Maximum $levels.Count)]
            Write-Log -Level $level -Message $activity
        }

        # Simulate warnings (5% chance)
        if ((Get-Random -Minimum 1 -Maximum 100) -gt 95) {
            $warnings = @(
                'Rate limit approaching',
                'API response slow',
                'Cache miss'
            )
            $warning = $warnings[(Get-Random -Minimum 0 -Maximum $warnings.Count)]
            Write-Log -Level "warn" -Message $warning
        }

        # Simulate errors (2% chance)
        if ((Get-Random -Minimum 1 -Maximum 100) -gt 98) {
            $errors = @(
                'Failed to connect to voice channel',
                'API request failed',
                'Command execution error'
            )
            $error = $errors[(Get-Random -Minimum 0 -Maximum $errors.Count)]
            Write-Log -Level "error" -Message $error
        }

        # Sleep for 5 seconds before next iteration
        Start-Sleep -Seconds 5
    }
}
finally {
    # This will run when the script is terminated
    Write-Log -Level "info" -Message "Bot is shutting down"
}