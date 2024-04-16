import ISocketClient from '../../../domain/models/user.interface';
import { Logger, OnModuleDestroy, ShutdownSignal } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import SocketEvent from 'src/domain/constants/socket_events';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { AuthGrpcService } from 'src/infrastructure/services/auth/auth.service';
import { MeetingGrpcService } from 'src/infrastructure/services/meeting/meeting.service';
import { WebRTCManager } from 'src/infrastructure/services/sfu/webrtc_manager';

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
    private readonly authService: AuthGrpcService,
    private readonly meetingService: MeetingGrpcService,
    private readonly environment: EnvironmentConfigService,
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

      const userId = client.request['userId'];

      this.authService.createCCU({
        socketId: client.id,
        podName: this.environment.getPodName(),
        userId,
      });
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      return client.disconnect(true);
    }
  }

  async handleDisconnect(client: ISocketClient) {
    try {
      this.authService.removeCCU({
        socketId: client.id,
      });

      const info = this.rtcManager.leaveRoom({ clientId: client.id });

      if (info) {
        client.broadcast
          .to(info.roomId)
          .emit(SocketEvent.participantHasLeftSSC, {
            targetId: info.participantId,
          });

        client.leave(info.roomId);

        const succeed = await this.meetingService.leaveRoom(info);
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

        // Delete CCU & participants in this pod
        this.authService.shutDownPod({
          podName: this.environment.getPodName(),
        });
      } catch (error) {
        this.logger.log(error?.message, error?.stack);
      }
    }
  }

  // Utils: Use for other service want to emit client in realtime
  async emitTo({
    data,
    event,
    room,
  }: {
    data: any;
    event: string;
    room: string;
  }) {
    this.server.to(room).emit(event, data);
  }
}
