$ErrorActionPreference = "SilentlyContinue"

$seeded_tables = @( # Names of non-enum tables for which we have exported seed data
    'User',
    'Tournament',
    'ScoringRuleset'
)

$dev_utils_folder = $MyInvocation.MyCommand.Path | Split-Path -Parent
$t4_root_folder = $dev_utils_folder | Split-Path -Parent
$env_file = Join-Path $t4_root_folder ".\.env"

Get-Content $env_file | ForEach-Object {
    $name, $value = $_.Split('=')
    New-Variable -Name $name -Value $value
}

Set-Location $dev_utils_folder\..\hasura-data\seeds\

foreach ($table in $seeded_tables) {
    $search_path = '*' + $table + 'Seed.sql'
    Get-ChildItem -Recurse $search_path | ForEach-Object { Write-Host $_; hasura seed apply --database-name default -f $_.Name --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET }
}