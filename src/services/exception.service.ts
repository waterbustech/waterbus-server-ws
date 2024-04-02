import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WsException } from '@nestjs/websockets';
import {
  IExceptions,
  IFormatExceptionMessage,
} from 'src/config/exceptions/exception';

@Injectable()
export class ExceptionsService implements IExceptions {
  throwInternalError(error: IFormatExceptionMessage): void {
    throw new WsException(error?.message);
  }

  throwNotFound() {
    throw new NotFoundException({
      code: '004',
      message: 'Not found',
    });
  }
  throwForbidden() {
    throw new ForbiddenException({
      code: '003',
      message: 'Forbidden',
    });
  }
}
