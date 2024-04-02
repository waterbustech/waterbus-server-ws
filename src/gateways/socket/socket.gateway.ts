import ISocketClient from '../../models/user.interface';
import { Logger, OnModuleDestroy, ShutdownSignal } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import SocketEvent from 'src/constants/socket_events';
import { MeetingGrpcService } from 'src/services/meeting/meeting.service';
import { WebRTCManager } from 'src/services/sfu/webrtc_manager';

@WebSocketGateway({ cors: true })
export class SocketGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  constructor(
    private readonly rtcManager: WebRTCManager,
    private readonly meetingService: MeetingGrpcService,
  ) {}

  @WebSocketServer() public server: Server;

  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Waterbus is ready to use!');
  }

  async handleConnection(client: ISocketClient) {
    try {
      this.logger.debug(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      return client.disconnect(true);
    }
  }

  async handleDisconnect(client: ISocketClient) {
    try {
      let info = this.rtcManager.leaveRoom({ clientId: client.id });

      if (info) {
        client.broadcast
          .to(info.roomId)
          .emit(SocketEvent.participantHasLeftSSC, {
            targetId: info.participantId,
          });

        client.leave(info.roomId);

        let succeed = await this.meetingService.leaveRoom(info);
        this.logger.debug(`Update leave room in grpc: ${succeed}`);
      }
      this.logger.debug(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
    }
  }

  async onModuleDestroy(signal?: string): Promise<void> {
    if (signal === ShutdownSignal.SIGTERM) {
      try {
        this.logger.debug(`Pod is shutting down...`);
      } catch (error) {
        this.logger.log(error?.message, error?.stack);
      }
    }
  }
}
