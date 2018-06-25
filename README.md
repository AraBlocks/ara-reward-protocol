# farming-protocol

ARA Farming Protocol (AFP) provides methods for distributed decentralized services, or decents, in the ARA Network to request work from its peers and determine the specifications of work contracts (i.e. rewards and other service-specific details). 

## Status
This project is still in alpha development.

## Introduction
AFP defines a set of methods in Javascript and objects in Proto which enable peers of a distributed service to communicate about and define a statement of work for that service. AFP also provides a default implementation using gRPC servers/clients in Javascript.

For a farmer, AFP would be used to define that farmer’s minimum accepted rewards for providing a service, as well as other parameters more specific to the service. If a requester wishes to hire a farmer, AFP would handle signing a contract of work and sending a start signal for beginning the work.

For a requester, AFP would be used to define the maximum reward the requester is willing to give for a service, the number of farmers required, and other parameters specific to the service. AFP would also take in a matcher used to determine the peers. Once a set of peers is determined through the matcher, AFP would handle initiating and signing a contract of work, and sending a start signal to begin the distribution of work.

## Contributing
- [How to contribute](CONTRIBUTING.md)
- [Commit message format](COMMIT_FORMAT.md)
- [Commit message examples](COMMIT_FORMAT_EXAMPLES.md)

## License
LGPL-3.0
