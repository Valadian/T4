#! /bin/bash

# Read list of key/value pairs from .env and export into user's local env vars
# the bash shebang is important! This doesn't work in sh or (apparently?) dash

set -a
source <(cat .env | sed -e '/^#/d;/^\s*$/d' -e "s/'/'\\\''/g" -e "s/=\(.*\)/='\1'/g")
set +a