import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import SocketEvent from 'src/domain/constants/socket_events';
import ISocketClient from 'src/domain/models/user.interface';
import { Logger } from '@nestjs/common';
import { JoinRoomDto } from './dtos/join_room.dto';
import { SendCandidateDto } from './dtos/send_candidate.dto';
import { SetScreenSharingDto } from './dtos/set_screen_sharing.dto';
import { SetHardwareStatusDto } from './dtos/set_hardware_status.dto';
import { SubscribeDto } from './dtos/subscribe.dto';
import { AnswerSubscribeDto } from './dtos/answer_subscribe.dto';
import { handleError } from 'src/infrastructure/helpers/error_handler';
import * as webrtc from 'werift';
import { SentCameraTypeDto } from './dtos/set_camera_type.dto';
import { WebRTCManager } from 'src/infrastructure/services/sfu/webrtc_manager';
import { MeetingGrpcService } from 'src/infrastructure/services/meeting/meeting.service';
import RedisEvents from 'src/domain/constants/redis_events';
import { MessageBroker } from 'src/infrastructure/services/message-broker/message-broker';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';

@WebSocketGateway()
export class MeetingGateway {
  private podName: string;

  constructor(
    private readonly rtcManager: WebRTCManager,
    private readonly meetingService: MeetingGrpcService,
    private readonly messageBroker: MessageBroker,
    private readonly environment: EnvironmentConfigService,
  ) {
    this.podName = this.environment.getPodName();
  }

  @WebSocketServer() private server: Server;
  private logger: Logger = new Logger('MeetingGateway');

  @SubscribeMessage(SocketEvent.publishCSS)
  async handleJoinRoom(client: ISocketClient, payload: JoinRoomDto) {
    try {
      this.rtcManager.addClient({
        clientId: client.id,
        info: {
          participantId: payload.participantId,
          roomId: payload.roomId,
          isPublish: true,
        },
      });

      const participantInfo = await this.meetingService.getParticipantById({
        participantId: payload.participantId,
        socketId: client.id,
      });

      if (!participantInfo) return;

      const responsePayload = await this.rtcManager.joinRoom(
        client.id,
        payload.sdp,
        payload.isVideoEnabled,
        payload.isAudioEnabled,
        payload.isE2eeEnabled,
        {
          callback: () => {
            client.broadcast
              .to(payload.roomId)
              .emit(SocketEvent.newParticipantSSC, participantInfo);
          },
        },
      );

      client.join(payload.roomId);

      this.server.to(client.id).emit(SocketEvent.publishSSC, responsePayload);
    } catch (error) {
      handleError(SocketEvent.publishCSS, error.toString());
    }
  }

  @SubscribeMessage(SocketEvent.subscribeCSS)
  async handleSubscribe(client: ISocketClient, payload: SubscribeDto) {
    try {
      const participantInfo = await this.meetingService.getParticipantById({
        participantId: payload.targetId,
        socketId: 'WSid',
      });

      if (!participantInfo) return;

      if (participantInfo.ccu.podName == this.podName) {
        const responsePayload = await this.rtcManager.subscribe({
          clientId: client.id,
          targetId: payload.targetId,
          socketClient: client,
        });

        this.server.to(client.id).emit(SocketEvent.answerSubscriberSSC, {
          targetId: payload.targetId,
          ...responsePayload,
        });
      } else {
        const clientInfo = this.rtcManager.getClientBySocketId({
          clientId: client.id,
        });

        if (!clientInfo) return;

        this.messageBroker.publishRedisChannel(
          participantInfo.ccu.podName,
          RedisEvents.SUBSCRIBE,
          {
            participantId: clientInfo.participantId,
            roomId: clientInfo.roomId,
            targetId: payload.targetId,
            clientId: client.id,
          },
        );
      }
    } catch (error) {
      handleError(SocketEvent.subscribeCSS, error.toString());
    }
  }

  @SubscribeMessage(SocketEvent.answerSubscriberCSS)
  async handleAnswerSubscribeCSS(
    client: ISocketClient,
    payload: AnswerSubscribeDto,
  ) {
    const participantInfo = await this.meetingService.getParticipantById({
      participantId: payload.targetId,
      socketId: 'WSid',
    });

    if (!participantInfo) return;

    if (participantInfo.ccu.podName == this.podName) {
      await this.rtcManager.setDescriptionSubscriber({
        clientId: client.id,
        targetId: payload.targetId,
        sdp: payload.sdp,
      });
    } else {
      this.messageBroker.publishRedisChannel(
        participantInfo.ccu.podName,
        RedisEvents.ADD_DESCRIPTION,
        {
          clientId: client.id,
          targetId: payload.targetId,
          sdp: payload.sdp,
        },
      );
    }
  }

  @SubscribeMessage(SocketEvent.publisherCandidateCSS)
  async handlePublisherCandidate(
    client: ISocketClient,
    payload: webrtc.RTCIceCandidate,
  ) {
    await this.rtcManager.addPublisherIceCandidate({
      clientId: client.id,
      candidate: payload,
    });
  }

  @SubscribeMessage(SocketEvent.subscriberCandidateCSS)
  async handleSubscriberCandidate(
    client: ISocketClient,
    payload: SendCandidateDto,
  ) {
    const participantInfo = await this.meetingService.getParticipantById({
      participantId: payload.targetId,
      socketId: 'WSid',
    });

    if (!participantInfo) return;

    if (participantInfo.ccu.podName == this.podName) {
      await this.rtcManager.addSubscriberIceCandidate({
        clientId: client.id,
        targetId: payload.targetId,
        candidate: payload.candidate,
      });
    } else {
      this.messageBroker.publishRedisChannel(
        participantInfo.ccu.podName,
        RedisEvents.ADD_CANDIDATE,
        {
          clientId: client.id,
          targetId: payload.targetId,
          candidate: payload.candidate,
        },
      );
    }
  }

  @SubscribeMessage(SocketEvent.setE2eeEnabledCSS)
  handleSetE2eeEnable(client: ISocketClient, payload: SetHardwareStatusDto) {
    const clientInfo = this.rtcManager.getClientBySocketId({
      clientId: client.id,
    });

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const targetId = clientInfo.participantId;

    if (!roomId) return;

    const isEnabled = payload.isEnabled;

    this.rtcManager.setE2eeEnabled({ clientId: client.id, isEnabled });

    client.broadcast.to(roomId).emit(SocketEvent.setE2eeEnabledSSC, {
      isEnabled,
      participantId: targetId,
    });
  }

  @SubscribeMessage(SocketEvent.setCameraTypeCSS)
  handleSetCameraType(client: ISocketClient, payload: SentCameraTypeDto) {
    const clientInfo = this.rtcManager.getClientBySocketId({
      clientId: client.id,
    });

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const targetId = clientInfo.participantId;

    if (!roomId) return;

    const type = payload.type;

    this.rtcManager.setCameraType({ clientId: client.id, type });

    client.broadcast.to(roomId).emit(SocketEvent.setCameraTypeSSC, {
      type,
      participantId: targetId,
    });
  }

  @SubscribeMessage(SocketEvent.setVideoEnabledCSS)
  handleSetVideoEnable(
    client: ISocketClient,
    payload: SetHardwareStatusDto,
  ): any {
    const clientInfo = this.rtcManager.getClientBySocketId({
      clientId: client.id,
    });

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const targetId = clientInfo.participantId;

    if (!roomId) return;

    const isEnabled = payload.isEnabled;

    this.rtcManager.setVideoEnabled({ clientId: client.id, isEnabled });

    client.broadcast.to(roomId).emit(SocketEvent.setVideoEnabledSSC, {
      isEnabled,
      participantId: targetId,
    });
  }

  @SubscribeMessage(SocketEvent.setAudioEnabledCSS)
  handleSetAudioEnable(
    client: ISocketClient,
    payload: SetHardwareStatusDto,
  ): any {
    const clientInfo = this.rtcManager.getClientBySocketId({
      clientId: client.id,
    });

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const targetId = clientInfo.participantId;

    if (!roomId) return;

    const isEnabled = payload.isEnabled;

    this.rtcManager.setAudioEnabled({ clientId: client.id, isEnabled });

    client.broadcast.to(roomId).emit(SocketEvent.setAudioEnabledSSC, {
      isEnabled,
      participantId: targetId,
    });
  }

  @SubscribeMessage(SocketEvent.setScreenSharingCSS)
  handleSetScreenSharing(
    client: ISocketClient,
    payload: SetScreenSharingDto,
  ): any {
    const clientInfo = this.rtcManager.getClientBySocketId({
      clientId: client.id,
    });

    if (!clientInfo) return;

    const roomId = clientInfo.roomId;
    const targetId = clientInfo.participantId;

    if (!roomId) return;

    const isSharing = payload.isSharing;

    this.rtcManager.setScreenSharing({ clientId: client.id, isSharing });

    client.broadcast.to(roomId).emit(SocketEvent.setScreenSharingSSC, {
      isSharing,
      participantId: targetId,
    });
  }

  @SubscribeMessage(SocketEvent.leaveRoomCSS)
  async handleLeaveRoom(client: ISocketClient, payload: any) {
    const info = this.rtcManager.leaveRoom({ clientId: client.id });

    if (info) {
      client.broadcast.to(info.roomId).emit(SocketEvent.participantHasLeftSSC, {
        targetId: info.participantId,
      });

      client.leave(info.roomId);

      const succeed = await this.meetingService.leaveRoom(info);
      this.logger.debug(`Update leave room in grpc: ${succeed}`);
    }
  }
}
