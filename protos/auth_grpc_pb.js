// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var auth_pb = require('./auth_pb.js');

function serialize_auth_VerifyTokenRequest(arg) {
  if (!(arg instanceof auth_pb.VerifyTokenRequest)) {
    throw new Error('Expected argument of type auth.VerifyTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_VerifyTokenRequest(buffer_arg) {
  return auth_pb.VerifyTokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_VerifyTokenResponse(arg) {
  if (!(arg instanceof auth_pb.VerifyTokenResponse)) {
    throw new Error('Expected argument of type auth.VerifyTokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_VerifyTokenResponse(buffer_arg) {
  return auth_pb.VerifyTokenResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var AuthServiceService = exports.AuthServiceService = {
  verifyToken: {
    path: '/auth.AuthService/verifyToken',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.VerifyTokenRequest,
    responseType: auth_pb.VerifyTokenResponse,
    requestSerialize: serialize_auth_VerifyTokenRequest,
    requestDeserialize: deserialize_auth_VerifyTokenRequest,
    responseSerialize: serialize_auth_VerifyTokenResponse,
    responseDeserialize: deserialize_auth_VerifyTokenResponse,
  },
};

exports.AuthServiceClient = grpc.makeGenericClientConstructor(AuthServiceService);
