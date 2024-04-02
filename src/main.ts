import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './config/redis.adapter';
import { EnvironmentConfigService } from './config/environments';
import { WsExceptionFilter } from './config/exceptions/ws_exception';
import { RpcExceptionFitler } from './config/exceptions/rpc_exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(EnvironmentConfigService);

  app.enableCors();
  app.useGlobalFilters(new WsExceptionFilter());
  app.useGlobalFilters(new RpcExceptionFitler());
  app.setGlobalPrefix('');
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis(config.getRedisUrl());
  app.useWebSocketAdapter(redisIoAdapter);
  app.enableShutdownHooks(['SIGTERM']);
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
