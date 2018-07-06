// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var messages_pb = require('./messages_pb.js');

function serialize_messages_ARAid(arg) {
  if (!(arg instanceof messages_pb.ARAid)) {
    throw new Error('Expected argument of type messages.ARAid');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_ARAid(buffer_arg) {
  return messages_pb.ARAid.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_messages_Contract(arg) {
  if (!(arg instanceof messages_pb.Contract)) {
    throw new Error('Expected argument of type messages.Contract');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_Contract(buffer_arg) {
  return messages_pb.Contract.deserializeBinary(new Uint8Array(buffer_arg));
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
  awardContract: {
    path: '/routeguide.RFP/AwardContract',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.Contract,
    responseType: messages_pb.Contract,
    requestSerialize: serialize_messages_Contract,
    requestDeserialize: deserialize_messages_Contract,
    responseSerialize: serialize_messages_Contract,
    responseDeserialize: deserialize_messages_Contract,
  },
  deliverReward: {
    path: '/routeguide.RFP/DeliverReward',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.SOW,
    responseType: messages_pb.ARAid,
    requestSerialize: serialize_messages_SOW,
    requestDeserialize: deserialize_messages_SOW,
    responseSerialize: serialize_messages_ARAid,
    responseDeserialize: deserialize_messages_ARAid,
  },
};

exports.RFPClient = grpc.makeGenericClientConstructor(RFPService);
