import { Module, forwardRef } from '@nestjs/common';
import { WebRTCManager } from './webrtc_manager';
import { EnvironmentConfigModule } from 'src/infrastructure/config/environment/environment.module';
import { GatewayModule } from 'src/infrastructure/gateways/gateway.module';

@Module({
  imports: [EnvironmentConfigModule, forwardRef(() => GatewayModule)],
  providers: [WebRTCManager],
  exports: [WebRTCManager],
})
export class WebRTCModule {}
