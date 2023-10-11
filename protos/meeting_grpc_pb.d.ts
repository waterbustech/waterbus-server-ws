// package: meeting
// file: protos/meeting.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as protos_meeting_pb from "../protos/meeting_pb";

interface IMeetingServiceService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  leaveRoom: IMeetingServiceService_IleaveRoom;
}

interface IMeetingServiceService_IleaveRoom
  extends grpc.MethodDefinition<
    protos_meeting_pb.LeaveRoomRequest,
    protos_meeting_pb.LeaveRoomResponse
  > {
  path: "/meeting.MeetingService/leaveRoom";
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<protos_meeting_pb.LeaveRoomRequest>;
  requestDeserialize: grpc.deserialize<protos_meeting_pb.LeaveRoomRequest>;
  responseSerialize: grpc.serialize<protos_meeting_pb.LeaveRoomResponse>;
  responseDeserialize: grpc.deserialize<protos_meeting_pb.LeaveRoomResponse>;
}

export const MeetingServiceService: IMeetingServiceService;

export interface IMeetingServiceServer {
  leaveRoom: grpc.handleUnaryCall<
    protos_meeting_pb.LeaveRoomRequest,
    protos_meeting_pb.LeaveRoomResponse
  >;
}

export interface IMeetingServiceClient {
  leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
  leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
  leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

export class MeetingServiceClient
  extends grpc.Client
  implements IMeetingServiceClient
{
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  );
  public leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public leaveRoom(
    request: protos_meeting_pb.LeaveRoomRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_meeting_pb.LeaveRoomResponse
    ) => void
  ): grpc.ClientUnaryCall;
}
