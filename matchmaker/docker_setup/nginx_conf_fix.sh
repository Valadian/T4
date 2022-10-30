#!/bin/bash

# easier than escaping a sed string in a Dockerfile... >.<
sed -i 's/#\ server_names_hash_bucket_size/server_names_hash_bucket_size/g' /etc/nginx/nginx.conf
chown www-data:www-data /usr/local/lib/python3.*/site-packages/matchmaker