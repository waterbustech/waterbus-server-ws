import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(RpcException)
export class RpcExceptionFitler implements RpcExceptionFilter {
  catch(exception: RpcException): Observable<any> {
    return throwError(() => exception.getError());
  }
}
