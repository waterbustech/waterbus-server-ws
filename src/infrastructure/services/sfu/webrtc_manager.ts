import * as webrtc from 'werift';
import SocketEvent from '../../../domain/constants/socket_events';
import { Room } from './room';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import ISocketClient from 'src/domain/models/user.interface';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { Server } from 'socket.io';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';
import { WrapperType } from 'src/infrastructure/config/types/wrapper-type';
import { IClient } from 'src/domain/models/client.interface';
import { MeetingGrpcService } from '../meeting/meeting.service';
import { MessageBroker } from '../message-broker/message-broker';
import { RedisChannel } from 'src/domain/constants/redis_channel';
import RedisEvents from 'src/domain/constants/redis_events';
import { UploadFilesService } from '../uploads/upload-files.service';

@Injectable()
export class WebRTCManager {
  private rooms: Record<string, Room> = {};
  private clients: Record<string, IClient> = {};
  private logger: Logger;

  constructor(
    private readonly environment: EnvironmentConfigService,
    private readonly uploadFilesService: UploadFilesService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: WrapperType<SocketGateway>,
    @Inject(forwardRef(() => MeetingGrpcService))
    private readonly meetingGrpcService: WrapperType<MeetingGrpcService>,
    @Inject(forwardRef(() => MessageBroker))
    private readonly messageBroker: WrapperType<MessageBroker>,
  ) {
    this.logger = new Logger(WebRTCManager.name);
  }

  async joinRoom(
    clientId: string,
    sdp: string,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    isE2eeEnabled: boolean,

    { callback }: { callback: () => void },
  ) {
    try {
      const clientInfo = this.clients[clientId];

      if (!clientInfo) return;

      const roomId = clientInfo.roomId;
      const participantId = clientInfo.participantId;

      if (!this.rooms[roomId]) {
        this.rooms[roomId] = new Room(
          this.environment,
          this.socketGateway,
          this.meetingGrpcService,
          this.uploadFilesService,
          roomId,
        );
      }

      const room = this.rooms[roomId];

      const { offer, otherParticipants, isRecording } = await room.join(
        sdp,
        isVideoEnabled,
        isAudioEnabled,
        isE2eeEnabled,
        participantId,
        {
          callback: callback,
        },
      );

      return {
        sdp: offer,
        otherParticipants: otherParticipants,
        isRecording: isRecording,
      };
    } catch (error) {
      this.logger.error(
        `Establish publisher failure with error: ${JSON.stringify(error)}`,
      );
    }
  }

  async subscribe({
    clientId,
    targetId,
    socketClient,
  }: {
    clientId: string;
    targetId: string;
    socketClient: ISocketClient | Server;
  }) {
    try {
      const clientInfo = this.clients[clientId];

      if (!clientInfo) return;

      const roomId = clientInfo.roomId;
      const participantId = clientInfo.participantId;

      if (participantId == targetId) return;

      const room = this.rooms[roomId];

      if (!room) return;

      const offer = await room.subscribe(targetId, participantId, clientId, {
        gotIceCandidate: (candidate) => {
          if (socketClient instanceof Server) {
            // socketClient is of type Server
            socketClient.to(clientId).emit(SocketEvent.subscriberCandidateSSC, {
              targetId: targetId,
              candidate: candidate.toJSON(),
            });
          } else {
            // socketClient is of type ISocketClient
            socketClient.emit(SocketEvent.subscriberCandidateSSC, {
              targetId: targetId,
              candidate: candidate.toJSON(),
            });
          }
        },
      });

      return offer;
    } catch (error) {
      this.logger.error(
        `Establish subscriber failure with error: ${JSON.stringify(error)}`,
      );
    }
  }

  async setDescriptionSubscriber({
    clientId,
    targetId,
    sdp,
  }: {
    clientId: string;
    targetId: string;
    sdp: string;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    await room.setSubscriberRemoteDescription(targetId, participantId, sdp);
  }

  async handlePublisherRenegotiation({
    clientId,
    sdp,
  }: {
    clientId: string;
    sdp: string;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    const answerSdp = await room.handlePublisherRenegotiation(
      participantId,
      sdp,
    );

    this.socketGateway.server
      .to(clientId)
      .emit(SocketEvent.publisherRenegotiationSSC, {
        sdp: answerSdp,
      });
  }

  async handleSubscriberRenegotiation({
    clientId,
    targetId,
    sdp,
  }: {
    clientId: string;
    targetId: string;
    sdp: string;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    await room.setSubscriberRemoteDescription(targetId, participantId, sdp);
  }

  async addPublisherIceCandidate({
    clientId,
    candidate,
  }: {
    clientId: string;
    candidate: webrtc.RTCIceCandidate;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    await room.addPublisherIceCandidate(participantId, candidate);
  }

  async addSubscriberIceCandidate({
    clientId,
    targetId,
    candidate,
  }: {
    clientId: string;
    targetId: string;
    candidate: webrtc.RTCIceCandidate;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    await room.addSubscriberIceCandidate(targetId, participantId, candidate);
  }

  async setAudioEnabled({
    clientId,
    isEnabled,
  }: {
    clientId: string;
    isEnabled: boolean;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setAudioEnabled(participantId, isEnabled);
  }

  async setCameraType({ clientId, type }: { clientId: string; type: number }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setCameraType(participantId, type);
  }

  async setVideoEnabled({
    clientId,
    isEnabled,
  }: {
    clientId: string;
    isEnabled: boolean;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setVideoEnabled(participantId, isEnabled);
  }

  async setE2eeEnabled({
    clientId,
    isEnabled,
  }: {
    clientId: string;
    isEnabled: boolean;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setE2eeEnabled(participantId, isEnabled);
  }

  async setScreenSharing({
    clientId,
    isSharing,
  }: {
    clientId: string;
    isSharing: boolean;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setScreenSharing(participantId, isSharing);
  }

  async setHandRaising({
    clientId,
    isRaising,
  }: {
    clientId: string;
    isRaising: boolean;
  }) {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (!room) return;

    room.setHandRaising(participantId, isRaising);
  }

  startRecord({
    recordId,
    roomId,
    isGrpcRequest = true,
  }: {
    recordId: number;
    roomId: number;
    isGrpcRequest?: boolean;
  }): boolean {
    const room = this.rooms[roomId];

    if (!room) return false;

    if (room.recordId) return false;

    room.startRecord({ recordId });

    if (isGrpcRequest) {
      this.socketGateway.server
        .to(roomId.toString())
        .emit(SocketEvent.startRecordSSC);

      this.messageBroker.publishRedisChannel(
        RedisChannel.EVERYBODY,
        RedisEvents.START_RECORD,
        { recordId, roomId },
      );
    }

    return true;
  }

  stopRecord({
    roomId,
    isGrpcRequest = true,
  }: {
    roomId: number;
    isGrpcRequest?: boolean;
  }) {
    const room = this.rooms[roomId];

    if (!room || !room.recordId) return;

    const res = room.stopRecord();

    if (isGrpcRequest) {
      this.socketGateway.server
        .to(roomId.toString())
        .emit(SocketEvent.stopRecordSSC);

      this.messageBroker.publishRedisChannel(
        RedisChannel.EVERYBODY,
        RedisEvents.STOP_RECORD,
        { roomId },
      );
    }

    return res;
  }

  leaveRoom({ clientId }: { clientId: string }): IClient | null {
    const clientInfo = this.clients[clientId];

    if (!clientInfo) return null;

    const roomId = clientInfo.roomId;
    const participantId = clientInfo.participantId;

    const room = this.rooms[roomId];

    if (room) {
      room.leave(participantId);
    }

    this.removeClient({ clientId });

    return clientInfo;
  }

  // Manage Clients
  addClient({ clientId, info }: { clientId: string; info: IClient }) {
    if (this.clients[clientId]) return;

    this.clients[clientId] = info;
  }

  removeClient({ clientId }: { clientId: string }) {
    delete this.clients[clientId];
  }

  getClientBySocketId({ clientId }): IClient | null {
    return this.clients[clientId];
  }
}
