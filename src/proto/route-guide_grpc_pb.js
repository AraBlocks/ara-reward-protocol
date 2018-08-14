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

function serialize_messages_Receipt(arg) {
  if (!(arg instanceof messages_pb.Receipt)) {
    throw new Error('Expected argument of type messages.Receipt');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_Receipt(buffer_arg) {
  return messages_pb.Receipt.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_messages_Reward(arg) {
  if (!(arg instanceof messages_pb.Reward)) {
    throw new Error('Expected argument of type messages.Reward');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_messages_Reward(buffer_arg) {
  return messages_pb.Reward.deserializeBinary(new Uint8Array(buffer_arg));
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
  sendSow: {
    path: '/routeguide.RFP/SendSow',
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
  sendReward: {
    path: '/routeguide.RFP/SendReward',
    requestStream: false,
    responseStream: false,
    requestType: messages_pb.Reward,
    responseType: messages_pb.Receipt,
    requestSerialize: serialize_messages_Reward,
    requestDeserialize: deserialize_messages_Reward,
    responseSerialize: serialize_messages_Receipt,
    responseDeserialize: deserialize_messages_Receipt,
  },
};

exports.RFPClient = grpc.makeGenericClientConstructor(RFPService);
