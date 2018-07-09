// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var messages_pb = require('./messages_pb.js');

function serialize_messages_Agreement(arg) {
  if (!(arg instanceof messages_pb.Agreement)) {
    throw new Error('Expected argument of type messages.Agreement');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_Agreement(buffer_arg) {
  return messages_pb.Agreement.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_messages_Quote(arg) {
  if (!(arg instanceof messages_pb.Quote)) {
    throw new Error('Expected argument of type messages.Quote');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_Quote(buffer_arg) {
  return messages_pb.Quote.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_messages_SOW(arg) {
  if (!(arg instanceof messages_pb.SOW)) {
    throw new Error('Expected argument of type messages.SOW');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_SOW(buffer_arg) {
  return messages_pb.SOW.deserializeBinary(new Uint8Array(buffer_arg));
}


var RFPService = exports.RFPService = {
  getQuote: {
    path: '/routeguide.RFP/GetQuote',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.SOW,
    responseType: messages_pb.Quote,
    requestSerialize: serialize_messages_SOW,
    requestDeserialize: deserialize_messages_SOW,
    responseSerialize: serialize_messages_Quote,
    responseDeserialize: deserialize_messages_Quote,
  },
  sendAgreement: {
    path: '/routeguide.RFP/SendAgreement',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.Agreement,
    responseType: messages_pb.Agreement,
    requestSerialize: serialize_messages_Agreement,
    requestDeserialize: deserialize_messages_Agreement,
    responseSerialize: serialize_messages_Agreement,
    responseDeserialize: deserialize_messages_Agreement,
  },
};

exports.RFPClient = grpc.makeGenericClientConstructor(RFPService);
