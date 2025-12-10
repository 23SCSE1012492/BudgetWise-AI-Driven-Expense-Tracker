param(
	[int]$Port = 8000,
	[string]$Folder = "${PWD}"
)

Write-Host "Starting simple PowerShell static file server"
Write-Host "Serving folder: $Folder on http://localhost:$Port/"

Add-Type -AssemblyName System.Net.HttpListener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

try {
	while ($listener.IsListening) {
		$context = $listener.GetContext()
		Start-Job -ScriptBlock {
			param($ctx, $folder)
			$request = $ctx.Request
			$response = $ctx.Response

			# Normalize path
			$rawUrl = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
			if ([string]::IsNullOrEmpty($rawUrl)) { $rawUrl = 'index.html' }

			$filePath = Join-Path -Path $folder -ChildPath $rawUrl

			if (Test-Path $filePath -PathType Leaf) {
				try {
					$bytes = [System.IO.File]::ReadAllBytes($filePath)
					$response.ContentLength64 = $bytes.Length
					$ext = [System.IO.Path]::GetExtension($filePath).ToLower()
					switch ($ext) {
						'.html' { $contentType = 'text/html'; break }
						'.css'  { $contentType = 'text/css'; break }
						'.js'   { $contentType = 'application/javascript'; break }
						'.png'  { $contentType = 'image/png'; break }
						'.jpg'  { $contentType = 'image/jpeg'; break }
						'.jpeg' { $contentType = 'image/jpeg'; break }
						'.svg'  { $contentType = 'image/svg+xml'; break }
						'.json' { $contentType = 'application/json'; break }
						default { $contentType = 'application/octet-stream' }
					}
					$response.ContentType = $contentType
					$response.OutputStream.Write($bytes, 0, $bytes.Length)
				}
				catch {
					$response.StatusCode = 500
					$msg = "Error reading file: $_"
					$buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
					$response.OutputStream.Write($buffer, 0, $buffer.Length)
				}
			} else {
				$response.StatusCode = 404
				$msg = "404 - Not Found: $rawUrl"
				$buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
				$response.OutputStream.Write($buffer, 0, $buffer.Length)
			}
			$response.OutputStream.Close()
			$ctx.Response.Close()
		} -ArgumentList $context, $Folder | Out-Null
	}
}
finally {
	$listener.Stop()
	$listener.Close()
}
