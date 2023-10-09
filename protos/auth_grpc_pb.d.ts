// package: auth
// file: protos/auth.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as protos_auth_pb from "../protos/auth_pb";

interface IAuthServiceService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  verifyToken: IAuthServiceService_IverifyToken;
}

interface IAuthServiceService_IverifyToken
  extends grpc.MethodDefinition<
    protos_auth_pb.VerifyTokenRequest,
    protos_auth_pb.VerifyTokenResponse
  > {
  path: "/auth.AuthService/verifyToken";
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<protos_auth_pb.VerifyTokenRequest>;
  requestDeserialize: grpc.deserialize<protos_auth_pb.VerifyTokenRequest>;
  responseSerialize: grpc.serialize<protos_auth_pb.VerifyTokenResponse>;
  responseDeserialize: grpc.deserialize<protos_auth_pb.VerifyTokenResponse>;
}

export const AuthServiceService: IAuthServiceService;

export interface IAuthServiceServer {
  verifyToken: grpc.handleUnaryCall<
    protos_auth_pb.VerifyTokenRequest,
    protos_auth_pb.VerifyTokenResponse
  >;
}

export interface IAuthServiceClient {
  verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
  verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
  verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
}

export class AuthServiceClient
  extends grpc.Client
  implements IAuthServiceClient
{
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object
  );
  public verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
  public verifyToken(
    request: protos_auth_pb.VerifyTokenRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: protos_auth_pb.VerifyTokenResponse
    ) => void
  ): grpc.ClientUnaryCall;
}
