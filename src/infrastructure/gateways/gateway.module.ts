import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { MeetingGateway } from './meeting/meeting.gateway';
import { MeetingGrpcService } from 'src/infrastructure/services/meeting/meeting.service';
import { ClientGrpc } from '@nestjs/microservices';
import { ClientProxyModule } from 'src/infrastructure/client-proxy/client-proxy.module';
import { WebRTCModule } from 'src/infrastructure/services/sfu/webrtc.module';
import { EnvironmentConfigModule } from '../config/environment/environment.module';
import { AuthGrpcService } from '../services/auth/auth.service';
import { MessageBroker } from '../services/message-broker/message-broker';
import { WhiteBoardGrpcService } from '../services/meeting/white-board.service';

@Module({
  imports: [
    ClientProxyModule.register(),
    forwardRef(() => WebRTCModule),
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
    {
      provide: WhiteBoardGrpcService,
      inject: [ClientProxyModule.whiteBoardClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new WhiteBoardGrpcService(clientProxy),
    },
    SocketGateway,
    MeetingGateway,
    MessageBroker,
  ],
  exports: [SocketGateway, MeetingGrpcService, MessageBroker],
})
export class GatewayModule {}
