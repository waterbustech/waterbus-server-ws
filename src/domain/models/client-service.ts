import { ClientGrpc } from '@nestjs/microservices';

export class ClientService<T> {
  constructor(
    private readonly client: ClientGrpc,
    private readonly serviceName: string,
  ) {}

  getInstance(): T {
    return this.client.getService<T>(this.serviceName);
  }
}
