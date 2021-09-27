#!/usr/bin/env bash

__PWD=$PWD
__DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
__PARENT_DIR=$(dirname $__DIR)

LOTUS_BIN="lotus"
LOTUS_SEED="lotus-seed"
LOTUS_MINER="lotus-miner"

##### Functions

restart_lotus() {

  echo "restarting"

}

configure_lotus() {

  mkdir ~/.lotus
  mkdir ~/.lotusminer

  echo -e "\nPre-seal some sectors:\n"
  $LOTUS_SEED pre-seal --sector-size 2KiB --num-sectors 2

  export ROOT=t101

  echo -e "\nCreate the genesis block and start up the first node:\n"
  $LOTUS_SEED genesis new localnet.json
  $LOTUS_SEED genesis add-miner localnet.json ~/.genesis-sectors/pre-seal-t01000.json
  jq '. + {VerifregRootKey: {Type: "multisig", Balance: "50000000000000000000000000", Meta: { Signers: ["t1vzw5hg23fn7ob4gfpzmzej7h76h6gjr3572elvi", "t1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci", "t1y4ih2ihcjc2kx25wudxke7upphnqaxcepd4idua"], Threshold: 1 }}}' localnet.json > localnet2.json

  cp localnet2.json localnet.json
  tmux new-session -s lotus -n script -d bash setup.sh

  cp ~/config.toml ~/.lotus/config.toml
  sleep 5
#  $LOTUS_BIN daemon --lotus-make-genesis=dev.gen --genesis-template=localnet.json --bootstrap=false
  tmux new-window -t lotus:1 -n daemon -d $LOTUS_BIN daemon --lotus-make-genesis=dev.gen --genesis-template=localnet.json --bootstrap=false

  $LOTUS_BIN wait-api
  echo -e "\nImporting the genesis miner key:\n"
  $LOTUS_BIN wallet import ~/.genesis-sectors/pre-seal-t01000.key
  $LOTUS_BIN wallet import rootkey1

  sleep 3
  echo -e "\nSetting up the genesis miner:\n"
  $LOTUS_MINER init --genesis-miner --actor=t01000 --sector-size=2KiB \
    --pre-sealed-sectors=~/.genesis-sectors \
    --pre-sealed-metadata=~/.genesis-sectors/pre-seal-t01000.json --nosync

  sleep 3
  echo -e "\nStarting up the miner:\n"
  cp ~/config-miner.toml ~/.lotusminer/config.toml
  tmux new-window -t lotus:2 -n miner -d $LOTUS_MINER run --nosync
#  $LOTUS_MINER run --nosync
}

restart_lotus() {
  tmux new-session -s lotus -n script -d bash -c "sleep 10000000"
  tmux new-window -t lotus:1 -n daemon -d $LOTUS_BIN daemon --genesis=dev.gen --bootstrap=false
  $LOTUS_BIN wait-api
  tmux new-window -t lotus:2 -n miner -d $LOTUS_MINER run --nosync
}

main() {

  echo -e "\nUsing Lotus Path: $LOTUS_PATH \n"

  if [ -f ~/.lotusminer/token ]; then
    restart_lotus
  else
    configure_lotus
  fi

  sleep 10

  echo "Token for node: $(cat ~/.lotus/token)"
  echo "Token for miner: $(cat ~/.lotusminer/token)"

  sleep 10

  export MAIN=$(cat /root/.genesis-sectors/pre-seal-t01000.json | jq  -r '.t01000."Owner"')
  lotus send --from "$MAIN" t16ae3lwcive5aws7eifk5a4sow77zwiguwmogb2y 10

  lotus send --from "$MAIN" t1rbfyvybljzd5xcouqjx22juucdj3xbwtro2crwq 10

  lotus send --from "$MAIN" t1fmqtnifrcnv4753hoyhjalgsv5klimrxmk7ekoq 10
  lotus send --from "$MAIN" t1us742aljq3rregf6eldkdbi2ymsnfifhq7meyly 10
  lotus send --from "$MAIN" t1gechnbsldgbqan4q2dwjsicbh25n5xvvdzhqd3y 10
  lotus send --from "$MAIN" t1o47ee4dqp6fn7hacdalcai5seoxtms2327bpccq 10

  lotus send --from "$MAIN" t1ovug2aycii62mkempr2e2hiwgwrvxpdfhb7vfda 10
  lotus send --from "$MAIN" t1gkzlw6vjzo3s7wgu7yxdxri2562b43hvwxzhzxa 10
  lotus send --from "$MAIN" t1cncuf2kvfzsmsij3opaypup527ounnpwhiicdci 10
  lotus send --from "$MAIN" t1h6tinlpvveqhpt6gdsjgndq4ocd2s7h4quediha 10
  lotus send --from "$MAIN" t1we63b6yzqusmcfwgtvcqe2snwa7t252c5lg2aja 10

  tail -f /dev/null
}

#### Main

main
