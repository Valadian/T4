#! /bin/bash

export SEEDED_TABLES=("User" "Tournament") # Names of non-enum tables for which we have exported seed data

export DEV_UTILS_FOLDER="${0%/*}"

cd "$DEV_UTILS_FOLDER/../www/hasura-data" || exit

for TABLE in ${SEEDED_TABLES[@]}; do
    echo "Planting $TABLE seeds..."
    find . -name "*"$TABLE"Seed.sql" | xargs -I PpP basename PpP | while read -r SEEDFILE; do
        hasura seed apply --database-name default -f $SEEDFILE || echo "Error applying "$SEEDFILE" seed; seed data may be incomplete."
    done
    echo "-"
done