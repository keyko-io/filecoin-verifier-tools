#!/bin/bash

cd ~/filecoin-verifier-service

export NODE_TOKEN=$(cat ~/.lotus/token)
export APP_PRIVATE_KEY=321624d625d2b3654a6e20b411b502b3f3c2e2dcee3742ecb755b7926b7f8a58
export RUN_APP_SERVICE=false

yarn run start
