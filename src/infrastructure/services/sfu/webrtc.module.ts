import { Module, forwardRef } from '@nestjs/common';
import { WebRTCManager } from './webrtc_manager';
import { EnvironmentConfigModule } from 'src/infrastructure/config/environment/environment.module';
import { GatewayModule } from 'src/infrastructure/gateways/gateway.module';
import { RecordGrpcController } from 'src/infrastructure/controllers/records/records.proto.controller';
import { UploadFilesModule } from '../uploads/upload-files.module';
import { UploadFilesService } from '../uploads/upload-files.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    EnvironmentConfigModule,
    forwardRef(() => GatewayModule),
    UploadFilesModule,
    HttpModule,
  ],
  controllers: [RecordGrpcController],
  providers: [WebRTCManager, UploadFilesService],
  exports: [WebRTCManager],
})
export class WebRTCModule {}
