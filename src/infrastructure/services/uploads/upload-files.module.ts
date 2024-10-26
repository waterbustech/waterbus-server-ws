import { Module } from '@nestjs/common';
import { UploadFilesService } from './upload-files.service';
import { EnvironmentConfigModule } from 'src/infrastructure/config/environment/environment.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [EnvironmentConfigModule, HttpModule],
  providers: [UploadFilesService],
  exports: [UploadFilesService],
})
export class UploadFilesModule {}
