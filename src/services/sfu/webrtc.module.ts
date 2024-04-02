import { Module } from '@nestjs/common';
import { WebRTCManager } from './webrtc_manager';

@Module({
  providers: [WebRTCManager],
  exports: [WebRTCManager],
})
export class WebRTCModule {}
