#!/bin/bash

cd ~/filecoin-verifier-service

if [ -f app_msig_address ]; then
    echo "Using existing msig $(cat app_msig_address)"
else
    curl -H "Content-Type: application/json" -H "Authorization: Bearer $(cat ~/filecoin-verifier-service/token)" -d '{"applicationAddress": "t01007", "applicationId": 1, "datetimeRequested": 1}' localhost:3001/v1/verifier/app/register | jq -r .appMsigAddress > app_msig_address
    echo "Using new msig $(cat app_msig_address)"
fi

export APP_MSIG_ADDRESS=$(cat app_msig_address)
export NODE_TOKEN=$(cat ~/.lotus/token)
export APP_PRIVATE_KEY=321624d625d2b3654a6e20b411b502b3f3c2e2dcee3742ecb755b7926b7f8a58
export RUN_SERVICE=false
export SERVER_PORT=4001

yarn run start
