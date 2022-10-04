

$seeded_tables = @( # Names of non-enum tables for which we have exported seed data
    'User',
    'Tournament',
    'ScoringRuleset'
)

$dev_utils_folder = $MyInvocation.MyCommand.Path | Split-Path -Parent

Set-Location $dev_utils_folder\..\hasura-data

foreach($line in Get-Content ..\.env) {
    $kvp =$line.Split("=")
    if ($kvp[1].StartsWith("'")){

        #Set-Variable -Name "`$Env:$($kvp[0])" -Value $($kvp[1])
        [System.Environment]::SetEnvironmentVariable($kvp[0],$kvp[1])
    } else {
        [System.Environment]::SetEnvironmentVariable($kvp[0],"$($kvp[1])")
        #Set-Variable -Name "`$Env:$($kvp[0])" -Value "$($kvp[1])"
    }
    #Get-Variable -Name "`$Env:$($kvp[0])"
}

foreach ($table in $seeded_tables)
{
    & hasura seed create "$($table)Seed" --from-table $table --database-name 'default' --admin-secret "$Env:HASURA_GRAPHQL_ADMIN_SECRET"
}

Set-Location $dev_utils_folder