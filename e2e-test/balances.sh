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

while [ "5000000 FIL" != "$(lotus wallet balance t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y)" ]
do
 sleep 1
 lotus wallet balance t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y
done

sleep 10
echo 1
sleep 10
echo 2
sleep 10
echo 3
sleep 10
echo 4
sleep 10
echo 5
sleep 10
echo 6

#node $JSDIR/samples/api/new-msig.js
#sleep 15

#rm ~/filecoin-verifier-service/app_msig_address
#tmux new-window -t lotus:4 -n appservice -d bash run-app-service.sh

node $JSDIR/samples/api/propose-verifier.js t01009
lotus msig inspect t080
sleep 15
node $JSDIR/samples/api/propose-verifier.js t01004
lotus msig inspect t080
sleep 15
node $JSDIR/samples/api/propose-verifier.js t01003
sleep 15
lotus msig inspect t080

sleep 30
lotus msig inspect t01009
lotus msig inspect t01010

curl -H "Content-Type: application/json" -H "Authorization: Bearer $(cat ~/filecoin-verifier-service/token)" -d "{\"clientAddress\": \"$(lotus wallet new)\", \"datetimeRequested\": 1}" localhost:4001/v1/verifier/client/datacap

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

while true
do
 sleep 10
 lotus-miner sectors list
 lotus-miner sectors seal 2
done
