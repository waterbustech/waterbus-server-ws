import ISocketClient from '../../../domain/models/user.interface';
import { Logger, OnModuleDestroy, ShutdownSignal } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import SocketEvent from 'src/domain/constants/socket_events';
import { IClient } from 'src/domain/models/client.interface';
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

  private logger: Logger = new Logger(SocketGateway.name);
  private isDestroying: Boolean = false;

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Waterbus is ready to use!');
  }

  async handleConnection(client: ISocketClient) {
    try {
      const userId = client.request['userId'];

      this.authService.createCCU({
        socketId: client.id,
        podName: this.environment.getPodName(),
        userId,
      });

      this.server.to(client.id).emit(SocketEvent.sendPodNameSSC, {
        podName: this.environment.getPodName(),
      });
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
      return client.disconnect(true);
    }
  }

  async handleDisconnect(client: ISocketClient) {
    try {
      const info = await this.handleLeaveRoom(client);

      if (info) {
        if (!this.isDestroying) {
          const succeed = await this.meetingService.leaveRoom(info);
          this.logger.debug(`Update leave room in grpc: ${succeed}`);
        }
      }

      this.authService.removeCCU({
        socketId: client.id,
      });
      this.logger.debug(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
    }
  }

  @SubscribeMessage(SocketEvent.reconnect)
  async handleReconnect(client: ISocketClient) {
    await this.handleLeaveRoom(client);
  }

  async onModuleDestroy(signal?: string): Promise<void> {
    if (signal === ShutdownSignal.SIGTERM) {
      try {
        this.isDestroying = true;
        this.logger.debug(`Pod is shutting down...`);

        this.server.emit(SocketEvent.destroy, {
          podName: this.environment.getPodName(),
        });

        // Delete CCU & participants in this pod
        this.authService.shutDownPod({
          podName: this.environment.getPodName(),
        });
      } catch (error) {
        this.logger.log(error?.message, error?.stack);
      }
    }
  }

  async handleLeaveRoom(client: ISocketClient): Promise<IClient | null> {
    try {
      const info = this.rtcManager.leaveRoom({ clientId: client.id });

      if (info) {
        client.broadcast
          .to(info.roomId)
          .emit(SocketEvent.participantHasLeftSSC, {
            targetId: info.participantId,
          });

        client.leave(info.roomId);
      }

      return info;
    } catch (error) {
      this.logger.error(error?.message, error?.stack);
    }
  }

  // Utils: Use for other service want to emit client in realtime
  async emitTo({
    data,
    event,
    room,
    socketIds,
  }: {
    data: any;
    event: string;
    room: string | null;
    socketIds: string[];
  }) {
    if (room) {
      this.server.to(room).emit(event, data);
    }

    if (socketIds) {
      this.server.to(socketIds).emit(event, data);
    }
  }
}
