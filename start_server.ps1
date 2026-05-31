# PowerShell-based Local HTTP Server
# Serves static files on http://localhost:8080/

$port = 3000
$localPath = "c:\Users\kadam\OneDrive\Documents\Desktop\project"

$listener = New-Object System.Net.HttpListener

# Safely add multiple address prefixes
try { $listener.Prefixes.Add("http://127.0.0.1:$port/") } catch {}
try { $listener.Prefixes.Add("http://[::1]:$port/") } catch {}
try { $listener.Prefixes.Add("http://localhost:$port/") } catch {}

try {
    $listener.Start()
    Write-Host "🚀 Local Server successfully started at http://localhost:$port/ and http://127.0.0.1:$port/"
    Write-Host "👉 Press Ctrl+C in your terminal or use manage_task to stop."
} catch {
    Write-Error "Failed to start listener on port $port : $_"
    exit 1
}

# Cleanup on exit
register-engineevent -sourceidentifier ([System.Management.Automation.PSEngineEvent]::Exiting) -action {
    if ($listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq "/") { $url = "/index.html" }
        
        # Strip query strings or backslashes
        $cleanUrl = $url.Split('?')[0].Replace('/', '\')
        if ($cleanUrl.StartsWith('\')) {
            $cleanUrl = $cleanUrl.Substring(1)
        }
        
        $filePath = [System.IO.Path]::Combine($localPath, $cleanUrl)
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content Type Mapping
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".gif" { $response.ContentType = "image/gif" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $html = "<html><head><title>404 Not Found</title></head><body style='font-family:sans-serif; text-align:center; padding-top:50px;'><h1>404 Not Found</h1><p>The file <code>$url</code> could not be found in the workspace.</p></body></html>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Catch network or closing stream exceptions silently
    }
}
