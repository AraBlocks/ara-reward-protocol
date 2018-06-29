# farming-protocol

ARA Farming Protocol (AFP) provides methods for distributed decentralized services, or decents, in the ARA Network to request work from its peers and determine the specifications of work contracts (i.e. rewards and other service-specific details). 

### Introduction
AFP defines a set of methods in Javascript and objects in Proto which enable peers of a distributed service to communicate about and define a statement of work for that service. AFP also provides a default implementation using gRPC servers/clients in Javascript.

For a farmer, AFP would be used to define that farmer’s minimum accepted rewards for providing a service, as well as other parameters more specific to the service. If a requester wishes to hire a farmer, AFP would handle signing a contract of work and sending a start signal for beginning the work.

For a requester, AFP would be used to define the maximum reward the requester is willing to give for a service, the number of farmers required, and other parameters specific to the service. AFP would also take in a matcher used to determine the peers. Once a set of peers is determined through the matcher, AFP would handle initiating and signing a contract of work, and sending a start signal to begin the distribution of work.

## Status
This project is still in alpha development.

## Dependencies
- [node](https://nodejs.org)
- [grpc](https://www.npmjs.com/package/grpc)
- [grpc-tools](https://www.npmjs.com/package/grpc-tools)
- [google-protobuf](https://www.npmjs.com/package/google-protobuf)

## Installation
```
$ npm i
```

## Usage
The expected usage is for an application to implement their own extensions to the following classes:
- Authenticator
- Matcher
- QuoteGenerator
The application would then use these classes in the following way.

### Farmers
For broadcasting the ability to farm.
```js
// The credentials of the farmer
const farmerCredentials;

// The application's custom classes
const authenticator = new ExampleRequesterAuthenticator() 
const quoteGenerator = new ExampleQuoteGenerator()

// Broadcast on a specific port
const port = `localhost:50051` 
const farmer = new Farmer(farmerCredentials, quoteGenerator, authenticator)
broadcastFarmer(farmer, port)
```

### Requesters
For requesting a farming job.
```js
// The credentials of the requester
const requesterCredentials;

// The application's custom classes
const matcher = new ExampleMatcher()
const authenticator = new ExampleFarmerAuthenticator()

// The SOW of the request
const sow = new messages.SOW()

// Connect to a farmer (or set of farmers)
const connection = connectToFarmer(port)
const requester = new Requester(sow, matcher, authenticator)
requester.processFarmers([connection])
```

## Examples

### Multifarmer Simulation
This example generates and connects to 10 local farmers, then hires up to 5 farmers who charge <= 10 Ara per MB. The Requester Authenticator considers user 10057 as invalid requester. The Farmer Authenticator considers user 2 as an invalid farmer. In the case of an invalid farmer, the matcher finds a reserve farmer and hires that farmer instead.

```
$ node examples/multi-farmer-simulation/multi-farmer-simulation.js
```

## Local Development Setup
### Generating gRPC and Protobuf files 
This repo uses statically generated gRPC and Protobuf files. Further documentation on static generation can be found [here](https://github.com/grpc/grpc/tree/v1.6.x/examples/node/static_codegen) 

```bash
$ cd proto

$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` messages.proto
$ grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./ --grpc_out=./ --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` route_guide.proto
```

Note: For Windows, you may need to replace `which grpc_tools_node_protoc_plugin` with the full path to grpc_node_plugin.exe (including the .exe extension)  

### Tests
```
$ npm run test
```

## Contributing
- [How to contribute](/.github/CONTRIBUTING.md)
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)

## License
LGPL-3.0
