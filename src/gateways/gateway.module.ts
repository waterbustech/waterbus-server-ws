import { Module } from '@nestjs/common';
import { SocketGateway } from './socket/socket.gateway';
import { MeetingGateway } from './meeting/meeting.gateway';
import { MeetingGrpcService } from 'src/services/meeting/meeting.service';
import { ClientGrpc } from '@nestjs/microservices';
import { ClientProxyModule } from 'src/client-proxy/client-proxy.module';
import { WebRTCModule } from 'src/services/sfu/webrtc.module';

@Module({
  imports: [ClientProxyModule.register(), WebRTCModule],
  providers: [
    {
      provide: MeetingGrpcService,
      inject: [ClientProxyModule.meetingClientProxy],
      useFactory: (clientProxy: ClientGrpc) =>
        new MeetingGrpcService(clientProxy),
    },
    SocketGateway,
    MeetingGateway,
  ],
})
export class GatewayModule {}
