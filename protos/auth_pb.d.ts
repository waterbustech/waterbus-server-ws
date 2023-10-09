// package: auth
// file: protos/auth.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class VerifyTokenRequest extends jspb.Message { 
    getToken(): string;
    setToken(value: string): VerifyTokenRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VerifyTokenRequest.AsObject;
    static toObject(includeInstance: boolean, msg: VerifyTokenRequest): VerifyTokenRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VerifyTokenRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VerifyTokenRequest;
    static deserializeBinaryFromReader(message: VerifyTokenRequest, reader: jspb.BinaryReader): VerifyTokenRequest;
}

export namespace VerifyTokenRequest {
    export type AsObject = {
        token: string,
    }
}

export class VerifyTokenResponse extends jspb.Message { 
    getValid(): boolean;
    setValid(value: boolean): VerifyTokenResponse;
    getUserid(): string;
    setUserid(value: string): VerifyTokenResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): VerifyTokenResponse.AsObject;
    static toObject(includeInstance: boolean, msg: VerifyTokenResponse): VerifyTokenResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: VerifyTokenResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): VerifyTokenResponse;
    static deserializeBinaryFromReader(message: VerifyTokenResponse, reader: jspb.BinaryReader): VerifyTokenResponse;
}

export namespace VerifyTokenResponse {
    export type AsObject = {
        valid: boolean,
        userid: string,
    }
}
