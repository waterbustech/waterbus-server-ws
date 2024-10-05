import { Module } from '@nestjs/common';
import { EnvironmentConfigService } from './infrastructure/config/environment/environments';
import { GatewayModule } from './infrastructure/gateways/gateway.module';
import { EnvironmentConfigModule } from './infrastructure/config/environment/environment.module';
import { ChatGrpcController } from './infrastructure/controllers/chats/chats.proto.controller';
import { HealthCheckController } from './app.controller';

@Module({
  imports: [EnvironmentConfigModule, GatewayModule],
  controllers: [ChatGrpcController, HealthCheckController],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class AppModule {}
