const PROTO_PATH = './messages.proto'
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const routeguide = grpc.loadPackageDefinition(packageDefinition).routeguide;

module.exports = {
    grpc,
    routeguide
};