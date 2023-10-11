// package: meeting
// file: protos/meeting.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class LeaveRoomRequest extends jspb.Message { 
    getRoomid(): string;
    setRoomid(value: string): LeaveRoomRequest;
    getParticipantid(): string;
    setParticipantid(value: string): LeaveRoomRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LeaveRoomRequest.AsObject;
    static toObject(includeInstance: boolean, msg: LeaveRoomRequest): LeaveRoomRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LeaveRoomRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LeaveRoomRequest;
    static deserializeBinaryFromReader(message: LeaveRoomRequest, reader: jspb.BinaryReader): LeaveRoomRequest;
}

export namespace LeaveRoomRequest {
    export type AsObject = {
        roomid: string,
        participantid: string,
    }
}

export class LeaveRoomResponse extends jspb.Message { 
    getSucceed(): boolean;
    setSucceed(value: boolean): LeaveRoomResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LeaveRoomResponse.AsObject;
    static toObject(includeInstance: boolean, msg: LeaveRoomResponse): LeaveRoomResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LeaveRoomResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LeaveRoomResponse;
    static deserializeBinaryFromReader(message: LeaveRoomResponse, reader: jspb.BinaryReader): LeaveRoomResponse;
}

export namespace LeaveRoomResponse {
    export type AsObject = {
        succeed: boolean,
    }
}
