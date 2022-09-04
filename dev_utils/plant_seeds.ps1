$ErrorActionPreference = "SilentlyContinue"

$seeded_tables = @( # Names of non-enum tables for which we have exported seed data
    'User',
    'Tournament'
)

$dev_utils_folder = $MyInvocation.MyCommand.Path | Split-Path -Parent

Set-Location $dev_utils_folder\..\www\hasura-data\seeds\

foreach ($table in $seeded_tables)
{
    $search_path = '*'+$table+'Seed.sql'
    Get-ChildItem -Recurse $search_path |ForEach-Object {Write-Host $_; hasura seed apply --database-name default -f $_.Name}
}

Set-Location ../../..