import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { AuthGrpcService } from 'src/infrastructure/services/auth/auth.service';
import { DefaultEventsMap } from 'node_modules/socket.io/dist/typed-events';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly authService: AuthGrpcService;
  private readonly logger: Logger;
  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthGrpcService);
    this.logger = new Logger(RedisIoAdapter.name);
  }

  async connectToRedis(redisUrl: string): Promise<void> {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    options.transports = ['polling', 'websocket'];
    options.cors = {
      origin: '*',
      methods: ['GET', 'POST'],
    };
    options.allowEIO3 = true;
    options.allowRequest = async (request, allowFunction) => {
      const accessToken: any = request.headers?.authorization?.split(' ')[1];
      try {
        if (accessToken) {
          const verifyResponse = await this.authService.verifyToken({
            token: accessToken,
          });

          if (verifyResponse && verifyResponse.valid) {
            request['userId'] = verifyResponse.userId;
            return allowFunction(null, true);
          }
        }

        return allowFunction('Unauthorized', false);
      } catch (error) {
        this.logger.error(error?.message, error?.stack);
        return allowFunction(
          error?.message || 'The service is currently unavailable',
          false,
        );
      }
    };
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }

  close(server: any): any {
    super.close(server);
  }

  bindClientConnect(server: any, callback: any): any {
    super.bindClientConnect(server, callback);
  }

  bindMessageHandlers(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ): void {
    super.bindMessageHandlers(socket, handlers, transform);
  }

  bindClientDisconnect(client: any, callback: any): void {
    super.bindClientDisconnect(client, callback);
  }
}
