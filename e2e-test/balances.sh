#!/bin/bash

export JSDIR=../

sleep 20

lotus wait-api

lotus chain head

export MAIN=$(cat localnet.json | jq -r '.Accounts | .[0] | .Meta .Owner')

export ROOT1=t1vzw5hg23fn7ob4gfpzmzej7h76h6gjr3572elvi # t0101
export ROOT2=t1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci # t0102

# Send funds to root key
lotus send --from $MAIN $ROOT1 5000000
lotus send --from $MAIN $ROOT2 5000000

lotus send --from $MAIN $(lotus wallet new) 12
lotus send --from $MAIN $(lotus wallet new) 12

export VERIFIER=t1us742aljq3rregf6eldkdbi2ymsnfifhq7meyly
export VERIFIER2=$(lotus wallet new)
export CLIENT=$(lotus wallet new)

# Send funds to verifier
lotus send --from $MAIN $VERIFIER 5000000
lotus send --from $MAIN $VERIFIER2 5000000

# Send funds to client
lotus send --from $MAIN $CLIENT 5000000

lotus send --from $MAIN t1o47ee4dqp6fn7hacdalcai5seoxtms2327bpccq 5000000 # slate
lotus send --from $MAIN t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y 5000000 # textile

while [ "5000000 FIL" != "$(lotus wallet balance $ROOT2)" ]
do
 sleep 1
 lotus wallet balance $ROOT2
done

node $JSDIR/samples/api/new-msig.js
sleep 15

node $JSDIR/samples/api/propose-verifier.js t01009
lotus msig inspect t080
sleep 15
node $JSDIR/samples/api/propose-verifier.js t01004
lotus msig inspect t080
sleep 15
node $JSDIR/samples/api/propose-verifier.js t01003
sleep 15
lotus msig inspect t080

curl -H "Content-Type: application/json" -d '{"applicationAddress": "t01007", "applicationId": 1, "datetimeRequested": 1}' localhost:3001/verifier/app/register
sleep 15
lotus msig inspect t01009
lotus msig inspect t01010

curl -H "Content-Type: application/json" -d "{\"clientAddress\": \"$(lotus wallet new)\", \"datetimeRequested\": 1}" localhost:3001/verifier/client/datacap

lotus-shed verifreg list-verifiers

node $JSDIR/samples/api/add-client.js t01005
sleep 15
lotus-shed verifreg list-clients
node $JSDIR/samples/api/add-client.js t01006
sleep 15
lotus-shed verifreg list-clients

export DATA=$(lotus client import dddd | awk '{print $NF}')

lotus client local

lotus client deal --verified-deal --from $CLIENT $DATA t01000 0.005 1000000

while [ "3" != "$(lotus-miner sectors list | wc -l)" ]
do
 sleep 10
 lotus-miner sectors list
done

# curl -H "Content-Type: application/json" -H "Authorization: Bearer $(cat ~/.lotusminer/token)" -d '{"id": 1, "method": "Filecoin.SectorStartSealing", "params": [2]}' localhost:2345/rpc/v0
lotus-miner sectors seal 2

lotus-miner info

lotus-miner sectors list

while [ "3" != "$(lotus-miner sectors list | grep Proving | wc -l)" ]
do
 sleep 5
 lotus-miner sectors list | tail -n 1
 lotus-miner info | grep "Actual Power"
done

sleep 300000
