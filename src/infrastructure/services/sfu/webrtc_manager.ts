import * as webrtc from 'werift';
import SocketEvent from '../../../domain/constants/socket_events';
import { Room } from './room';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import ISocketClient from 'src/domain/models/user.interface';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { Server } from 'socket.io';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';

@Injectable()
export class WebRTCManager {
  private rooms: Record<string, Room> = {};
  private clients: Record<string, IClient> = {};
  private server: Server;
  private logger: Logger;

  constructor(
    private environment: EnvironmentConfigService,
    @Inject(forwardRef(() => SocketGateway))
    private socketGateway: SocketGateway,
  ) {
    this.logger = new Logger(WebRTCManager.name);
    this.server = socketGateway.server;
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
        this.rooms[roomId] = new Room(this.environment, this.server, roomId);
      }

      const room = this.rooms[roomId];

      const { offer, otherParticipants } = await room.join(
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

      const offer = await room.subscribe(targetId, participantId, {
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

    await room.setSubscriberDescriptionSubscriber(targetId, participantId, sdp);
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
