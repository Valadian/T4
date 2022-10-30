# Read list of key/value pairs from .env and export into user's local env vars

Get-Content .env | Where-Object {$_.length -gt 0} | Where-Object {!$_.StartsWith("#")} | ForEach-Object {

    $name, $value = $_.Split('=',2).Trim()
	Set-Content env:\$name $value
}