FROM ubuntu:18.04
MAINTAINER "Madeline Cameron <madeline@littlstar.com>"

## Image dependencies
RUN apt-get update && \
    apt-get -y upgrade && \
    apt-get -y install git curl build-essential python

## Mount working directory, seems like I have to copy this file to
COPY . /root

## Use mount as working directory
WORKDIR /root

## ssh key
RUN mkdir -p /root/.ssh/
COPY /config/id_rsa /root/.ssh/
RUN chmod 0600 /root/.ssh/id_rsa
RUN eval $(ssh-agent -s) && ssh-add /root/.ssh/id_rsa
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts
RUN echo "IdentityFile /root/.ssh/id_rsa" >> /etc/ssh/ssh_config

## Install Node
RUN ./scripts/nave usemain stable

## Install app dependencies
RUN npm install
RUN npm install -g --save ethereumjs-testrpc
RUN npm install -g truffle

## Install Ara specific utilities
RUN ./scripts/setup

# Expose port
EXPOSE 8545
# Start TestRPC
ENTRYPOINT ["testrpc"]
