#!/bin/bash

cd ~/filecoin-verifier-service

export NODE_TOKEN=$(cat ~/.lotus/token)

yarn run start
