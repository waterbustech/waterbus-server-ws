import { RedisClientType, createClient } from 'redis';
import { WebRTCManager } from '../sfu/webrtc_manager';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import RedisEvents from 'src/domain/constants/redis_events';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';
import SocketEvent from 'src/domain/constants/socket_events';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { RedisChannel } from 'src/domain/constants/redis_channel';
import { WrapperType } from 'src/infrastructure/config/types/wrapper-type';

@Injectable()
export class MessageBroker {
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private channel: string;
  private logger: Logger;

  constructor(
    @Inject(forwardRef(() => WebRTCManager))
    private readonly rtcManager: WrapperType<WebRTCManager>,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: WrapperType<SocketGateway>,
    private readonly environment: EnvironmentConfigService,
  ) {
    this.logger = new Logger(MessageBroker.name);

    this.channel = environment.getPodName();
    this.connectToRedis(environment.getRedisUrl());
  }

  async connectToRedis(redisUrl: string): Promise<void> {
    this.pubClient = createClient({ url: redisUrl });
    this.subClient = this.pubClient.duplicate();

    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);

    this.subscribeRedisChannel();
  }

  async publishRedisChannel(channel: string, event: string, message: any) {
    this.logger.debug(`Publish to [${channel}][${event}]`);
    await this.pubClient.publish(channel, JSON.stringify({ event, message }));
  }

  async subscribeRedisChannel() {
    this.subClient.subscribe(this.channel, (rawMessage) => {
      const { event, message } = JSON.parse(rawMessage);
      this.logger.debug(
        `Received message from channel [${this.channel}] [${event}]:  ${rawMessage}`,
      );
      switch (event) {
        case RedisEvents.SUBSCRIBE:
          this._handleSubscribleEvent(message);
          break;
        case RedisEvents.ADD_DESCRIPTION:
          this.rtcManager.setDescriptionSubscriber(message);
          break;
        case RedisEvents.ADD_CANDIDATE:
          this.rtcManager.addSubscriberIceCandidate(message);
          break;
        default:
          break;
      }
    });

    this.subClient.subscribe(RedisChannel.EVERYBODY, (rawMessage) => {
      const { event, message } = JSON.parse(rawMessage);
      this.logger.debug(
        `Received message from channel [${RedisChannel.EVERYBODY}] [${event}]:  ${rawMessage}`,
      );
      switch (event) {
        case RedisEvents.START_RECORD:
          this.rtcManager.startRecord({
            recordId: message.recordId,
            roomId: message.roomId,
            isGrpcRequest: false,
          });
          break;
        case RedisEvents.STOP_RECORD:
          this.rtcManager.stopRecord({
            roomId: message.roomId,
            isGrpcRequest: false,
          });
          break;
      }
    });
  }

  private _handleSubscribleEvent(message) {
    this.rtcManager.addClient({
      clientId: message.clientId,
      info: {
        participantId: message.participantId,
        roomId: message.roomId,
        isPublish: false,
      },
    });

    this.rtcManager
      .subscribe({
        clientId: message.clientId,
        targetId: message.targetId,
        socketClient: this.socketGateway.server,
      })
      .then((responsePayload) => {
        this.socketGateway.server
          .to(message.clientId)
          .emit(SocketEvent.answerSubscriberSSC, {
            targetId: message.targetId,
            ...responsePayload,
          });
      });
  }
}
