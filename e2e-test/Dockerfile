# initial version from https://github.com/openworklabs/filecoin-docker
# build container stage
FROM golang:1.17.3 AS build-env

# branch or tag of the lotus version to build
ARG BRANCH=v1.13.1

RUN echo "Building lotus from branch $BRANCH"

RUN apt-get update -y && \
    apt-get install sudo cron curl git mesa-opencl-icd ocl-icd-opencl-dev gcc git bzr jq pkg-config libhwloc-dev -y

RUN git clone https://github.com/filecoin-project/lotus.git  --depth 1 --branch $BRANCH && \
    cd lotus && \
    make clean

RUN cd lotus && \
    make 2k lotus-shed && \
    install -C ./lotus /usr/local/bin/lotus && \
    install -C ./lotus-miner /usr/local/bin/lotus-miner && \
    install -C ./lotus-worker /usr/local/bin/lotus-worker && \
    install -C ./lotus-shed /usr/local/bin/lotus-shed && \
    install -C ./lotus-seed /usr/local/bin/lotus-seed

# runtime container stage
FROM ubuntu:20.04

# Instead of running apt-get just copy the certs and binaries that keeps the runtime image nice and small
RUN apt-get update && \
    apt-get install sudo ca-certificates mesa-opencl-icd ocl-icd-opencl-dev tmux jq hwloc -y && \
    rm -rf /var/lib/apt/lists/*

COPY --from=build-env /usr/local/bin/lotus /usr/local/bin/lotus
COPY --from=build-env /usr/local/bin/lotus-miner /usr/local/bin/lotus-miner
COPY --from=build-env /usr/local/bin/lotus-worker /usr/local/bin/lotus-worker
COPY --from=build-env /usr/local/bin/lotus-shed /usr/local/bin/lotus-shed
COPY --from=build-env /usr/local/bin/lotus-seed /usr/local/bin/lotus-seed

RUN lotus fetch-params 2048

RUN apt-get update
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
RUN apt-get -y install nodejs 
RUN npm i -g yarn 

RUN apt-get -y install git

RUN git clone https://github.com/keyko-io/filecoin-verifier-tools/ --depth 1 --branch master

RUN cd filecoin-verifier-tools/ && \
    yarn

RUN mkdir -p /root/.lotus/keystore

COPY MF2XI2BNNJ3XILLQOJUXMYLUMU /root/.lotus/keystore/
COPY rpc-token /root/.lotus/token
COPY entrypoint.bash /bin/entrypoint
COPY rootkey1 /rootkey1
COPY dddd /dddd
COPY setup.sh /bin/setup.sh
COPY config.toml /root/config.toml
COPY config-miner.toml /root/config-miner.toml


RUN chmod 600 /root/.lotus/keystore/MF2XI2BNNJ3XILLQOJUXMYLUMU

# API port
EXPOSE 1234

# P2P port
EXPOSE 1235

EXPOSE 2345

ENTRYPOINT ["/bin/entrypoint"]

# docker build . -t mrsmkl/lotus:21-10-27
# docker run --name lotus --rm -ti -p 1234:1234 -p 2345:2345  mrsmkl/lotus:21-10-27
