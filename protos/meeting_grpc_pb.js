// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var meeting_pb = require('./meeting_pb.js');

function serialize_meeting_LeaveRoomRequest(arg) {
  if (!(arg instanceof meeting_pb.LeaveRoomRequest)) {
    throw new Error('Expected argument of type meeting.LeaveRoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_meeting_LeaveRoomRequest(buffer_arg) {
  return meeting_pb.LeaveRoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_meeting_LeaveRoomResponse(arg) {
  if (!(arg instanceof meeting_pb.LeaveRoomResponse)) {
    throw new Error('Expected argument of type meeting.LeaveRoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_meeting_LeaveRoomResponse(buffer_arg) {
  return meeting_pb.LeaveRoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var MeetingServiceService = exports.MeetingServiceService = {
  leaveRoom: {
    path: '/meeting.MeetingService/leaveRoom',
    requestStream: false,
    responseStream: false,
    requestType: meeting_pb.LeaveRoomRequest,
    responseType: meeting_pb.LeaveRoomResponse,
    requestSerialize: serialize_meeting_LeaveRoomRequest,
    requestDeserialize: deserialize_meeting_LeaveRoomRequest,
    responseSerialize: serialize_meeting_LeaveRoomResponse,
    responseDeserialize: deserialize_meeting_LeaveRoomResponse,
  },
};

exports.MeetingServiceClient = grpc.makeGenericClientConstructor(MeetingServiceService);
