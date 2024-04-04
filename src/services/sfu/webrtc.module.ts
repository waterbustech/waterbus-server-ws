import { Module } from '@nestjs/common';
import { WebRTCManager } from './webrtc_manager';
import { EnvironmentConfigModule } from 'src/config/environment.module';

@Module({
  imports: [EnvironmentConfigModule],
  providers: [WebRTCManager],
  exports: [WebRTCManager],
})
export class WebRTCModule {}
