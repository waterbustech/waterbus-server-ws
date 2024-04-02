import { Module } from '@nestjs/common';
import { EnvironmentConfigService } from './config/environments';
import { GatewayModule } from './gateways/gateway.module';
import { EnvironmentConfigModule } from './config/environment.module';

@Module({
  imports: [EnvironmentConfigModule, GatewayModule],
  providers: [EnvironmentConfigService],
  exports: [EnvironmentConfigService],
})
export class AppModule {}
