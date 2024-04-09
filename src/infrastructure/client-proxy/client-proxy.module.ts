import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { EnvironmentConfigModule } from 'src/infrastructure/config/environment/environment.module';
import { EnvironmentConfigService } from 'src/infrastructure/config/environment/environments';
import { EPackage, getIncludeDirs, getProtoPath } from 'waterbus-proto';

export const getGrpcClientOptions = (
  config: EnvironmentConfigService,
  _package: EPackage,
): GrpcOptions => {
  let url = '';
  switch (_package) {
    case EPackage.MEETING:
      url = config.getMeetingGrpcUrl();
      break;
  }
  return {
    transport: Transport.GRPC,
    options: {
      url: url,
      package: _package,
      protoPath: getProtoPath(_package),
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };
};

@Module({
  imports: [EnvironmentConfigModule],
})
export class ClientProxyModule {
  static meetingClientProxy = 'meetingClientProxy';
  static register(): DynamicModule {
    return {
      module: ClientProxyModule,
      providers: [
        {
          provide: ClientProxyModule.meetingClientProxy,
          inject: [EnvironmentConfigService],
          useFactory: (config: EnvironmentConfigService) =>
            ClientProxyFactory.create(
              getGrpcClientOptions(config, EPackage.MEETING),
            ),
        },
      ],
      exports: [ClientProxyModule.meetingClientProxy],
    };
  }
}
