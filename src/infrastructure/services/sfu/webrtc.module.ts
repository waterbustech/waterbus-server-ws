import { Module, forwardRef } from '@nestjs/common';
import { WebRTCManager } from './webrtc_manager';
import { EnvironmentConfigModule } from 'src/infrastructure/config/environment/environment.module';
import { GatewayModule } from 'src/infrastructure/gateways/gateway.module';
import { RecordGrpcController } from 'src/infrastructure/controllers/records/records.proto.controller';

@Module({
  imports: [EnvironmentConfigModule, forwardRef(() => GatewayModule)],
  controllers: [RecordGrpcController],
  providers: [WebRTCManager],
  exports: [WebRTCManager],
})
export class WebRTCModule {}
