#!/bin/bash

export JSDIR=/filecoin-verifier-tools/

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
lotus send --from $MAIN t1y4ih2ihcjc2kx25wudxke7upphnqaxcepd4idua 5000000

lotus send --from $MAIN $(lotus wallet new) 12
lotus send --from $MAIN $(lotus wallet new) 12
lotus send --from $MAIN $(lotus wallet new) 12
lotus send --from $MAIN $(lotus wallet new) 12

while [ "5000000 FIL" != "$(lotus wallet balance $ROOT2)" ]
do
 sleep 1
 lotus wallet balance $ROOT2
done


# export PARAM=$(lotus-shed verifreg add-verifier --dry t01003 100000000000000000000000000000000000000000)
# export PARAM2=$(lotus-shed verifreg add-verifier --dry t01004 100000000000000000000000000000000000000000)

lotus msig propose --from $ROOT1 t080 t06 0 2 824300eb0753000125dfa371a19e6f7cb54395ca0000000000
lotus msig inspect t080

sleep 5
lotus-shed verifreg list-verifiers

node $JSDIR/samples/api/propose-verifier.js t01004
sleep 15
lotus msig inspect t080
sleep 15

lotus-shed verifreg list-verifiers

# lotus-shed verifreg verify-client --from $VERIFIER $CLIENT 10000000000000000000000000000000000000000

node $JSDIR/samples/api/add-client.js t01005
sleep 15
lotus-shed verifreg list-clients
#node $JSDIR/samples/api/add-client.js $CLIENT
#sleep 15
#lotus-shed verifreg list-clients

export DATA=$(lotus client import dddd | awk '{print $NF}')

lotus client local

lotus client deal --verified-deal --from $CLIENT $DATA t01000 0.005 1000000

while true
do
 sleep 100
 lotus-miner sectors list
 lotus-miner sectors seal 2
done

