#!/usr/bin/env bash
# Copies the website files to both web servers
FILES="index.html style.css app.js facts.js myths.js"


for IP in 16.60.112.164 18.171.55.105; do
    echo "Deploying to $IP"
    # shellcheck disable=SC2086
    scp -i ~/.ssh/id_rsa_alu $FILES ubuntu@$IP:/tmp/
    ssh -i ~/.ssh/id_rsa_alu ubuntu@$IP "cd /tmp && sudo cp $FILES /var/www/html/"
done