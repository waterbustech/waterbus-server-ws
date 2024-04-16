import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { MeetingGateway } from './meeting/meeting.gateway';
import { MeetingGrpcService } from 'src/infrastructure/services/meeting/meeting.service';
import { ClientGrpc } from '@nestjs/microservices';
import { ClientProxyModule } from 'src/infrastructure/client-proxy/client-proxy.module';
import { WebRTCModule } from 'src/infrastructure/services/sfu/webrtc.module';
import { EnvironmentConfigModule } from '../config/environment/environment.module';
import { AuthGrpcService } from '../services/auth/auth.service';
import { MessageBroker } from '../services/message-broker/message-broker';

@Module({
  imports: [
    ClientProxyModule.register(),
    WebRTCModule,
    EnvironmentConfigModule,
  ],
  providers: [
    {
      provide: AuthGrpcService,
      inject: [ClientProxyModule.authClientProxy],
      useFactory: (clientProxy: ClientGrpc) => new AuthGrpcService(clientProxy),
    },
    {
      provide: MeetingGrpcService,
      inject: [ClientProxyModule.meetingClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new MeetingGrpcService(clientProxy),
    },
    MessageBroker,
    SocketGateway,
    MeetingGateway,
  ],
  exports: [SocketGateway],
})
export class GatewayModule {}
