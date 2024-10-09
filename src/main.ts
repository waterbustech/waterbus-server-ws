import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './infrastructure/config/socket/redis.adapter';
import { EnvironmentConfigService } from './infrastructure/config/environment/environments';
import { WsExceptionFilter } from './domain/models/exceptions/ws_exception';
import { RpcExceptionFitler } from './domain/models/exceptions/rpc_exception';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EPackage, getIncludeDirs, getProtoPath } from 'waterbus-proto';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(EnvironmentConfigService);

  // Create 'rec' directory if it doesn't exist
  const recDir = path.join(__dirname, '../rec');
  if (!fs.existsSync(recDir)) {
    fs.mkdirSync(recDir, { recursive: true });
    NestLogger.log(`Created directory: ${recDir}`, 'Bootstrap');
  }

  app.enableCors();
  app.useGlobalFilters(new WsExceptionFilter());
  app.useGlobalFilters(new RpcExceptionFitler());
  app.setGlobalPrefix('');
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(config.getRedisUrl());
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableShutdownHooks(['SIGTERM']);

  const configService = app.get(EnvironmentConfigService);
  const realtimeGrpcUrl = configService.getRealtimeGrpcUrl();
  const recordGrpcUrl = configService.getRecordGrpcUrl();

  const realtimeMicroserviceOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: EPackage.CHAT,
      protoPath: getProtoPath(EPackage.CHAT),
      url: realtimeGrpcUrl,
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };

  const recordMicroserviceOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: EPackage.RECORD,
      protoPath: getProtoPath(EPackage.RECORD),
      url: recordGrpcUrl,
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };

  app.connectMicroservice(realtimeMicroserviceOptions);
  app.connectMicroservice(recordMicroserviceOptions);

  await app.startAllMicroservices();
  await app.listen(config.getPort());
  return app.getUrl();
}

(async (): Promise<void> => {
  try {
    const url = await bootstrap();
    NestLogger.log(url, 'Bootstrap');
  } catch (error) {
    NestLogger.error(error, 'Bootstrap');
  }
})();
