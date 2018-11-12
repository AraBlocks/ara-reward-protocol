# <img src="https://github.com/arablocks/ara-farming-protocol/blob/master/ara.png" width="30" height="30" /> ara-farming-protocol examples

This folder contains an example intended to demonstrate usage of the farming protocol.

## Requirements

The examples require you to have:

- [Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup

While Ara Farming Protocol's dependencies are private, you need to provide your SSH key to validate your access. Copy your SSH key to `example/docker-cfs-replication/.ssh`. It will be temporarily mounted to the docker image to clone all the dependencies and removed afterward.

## Examples

### CFS Replication with Docker

This example shows CFS replication via communication over duplex streams. Docker is used to simulate the farming protocol running on two separate computers.

The farmer example broadcasts the ability to replicate an CFS for a certain price per GB. The requester example finds these farmers that have the specific CFS and communicates via duplex stream to determine the cost of replication. It uses the `MaxCostMatcher` to select a subset of peers.

#### Running the example

Prior to running the example, make sure that you have Docker and Docker-compose installed. Replace the default variables in `examples/docker-cfs-replication/local/constants.js` to experiment with different settings.

Build the docker image:

```
$ cd examples/docker-cfs-replication
$ docker build . -t ara/ara-farming
```

Run `docker-compose.yml` to create three separate containers, one for ganache-cli (contract), one for farmer and another for requester.

```
$ docker-compose -f ./local/docker-compose.yml up
```

After ganache is up and running in the current terminal, you can open other terminals to give instructions to the farmer and requester.

**Important**: there is a `local` folder inside farmer and requester dockers that directly binds to `examples/docker-cfs-replication/local`. This folder on the host machine can be moved elsewhere as long as `docker-compose.yml` is called from there.

Farmer

```
$ docker exec -it local_farmer_1 node remote-farmer
```

Requester

```
$ docker exec -it local_requester_1 node remote-requester
```
