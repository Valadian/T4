#! /bin/bash

export SEEDED_TABLES=("User" "Tournament" "ScoringRuleset") # Names of non-enum tables for which we have exported seed data

export DEV_UTILS_FOLDER="${0%/*}"

cd "$DEV_UTILS_FOLDER/../hasura-data" || exit

for TABLE in ${SEEDED_TABLES[@]}; do
    echo "Planting $TABLE seeds..."
    find . -name "*"$TABLE"Seed.sql" | xargs -I PpP basename PpP | while read -r SEEDFILE; do
        hasura seed apply --database-name default -f $SEEDFILE --admin-secret $HASURA_GRAPHQL_ADMIN_SECRET || echo "Error applying "$SEEDFILE" seed; seed data may be incomplete.  Admin secret was "$HASURA_GRAPHQL_ADMIN_SECRET
    done
    echo "-"
done