import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BehaviorSubject,
  catchError,
  interval,
  lastValueFrom,
  map,
  retry,
  Subject,
  Subscription,
  switchMap,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { ClientService } from 'src/domain/models/client-service';
import { whiteboard } from 'waterbus-proto';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Injectable()
export class WhiteBoardGrpcService implements OnModuleInit {
  private readonly logger: Logger;
  private whiteBoardService: whiteboard.WhiteBoardService;
  private $connectionSubject: BehaviorSubject<boolean>;
  private isConnected: boolean;
  private $reconnect: Subscription;

  constructor(private readonly whiteBoardClientProxy: ClientGrpc) {
    this.logger = new Logger(WhiteBoardGrpcService.name);
  }

  onModuleInit() {
    this.connect();
    this.$connectionSubject = new BehaviorSubject<boolean>(false);
    this.$connectionSubject.subscribe({
      next: (status) => {
        this.isConnected = status;
        if (!status) {
          this.$reconnect = interval(5000)
            .pipe()
            .subscribe({
              next: () => {
                this.logger.log('Retry to connect...');
                this.connect();
                this.checkConnection();
              },
            });
        } else {
          this.$reconnect.unsubscribe();
        }
      },
    });
  }

  connect(): void {
    this.whiteBoardService = new ClientService<whiteboard.WhiteBoardService>(
      this.whiteBoardClientProxy,
      'RecordService',
    ).getInstance();
  }

  private checkConnection(): void {
    this.whiteBoardService
      .ping({ message: 'ping' })
      .pipe(timeout(500), retry(3))
      .subscribe({
        next: (result) => {
          this.logger.log('Connected');
          const status = result?.message === 'ping';
          if (this.isConnected !== status) {
            this.$connectionSubject.next(status);
          }
        },
        error: () => {
          if (this.isConnected) this.$connectionSubject.next(false);
        },
      });
  }

  async getBoard(
    data: whiteboard.GetWhiteBoardRequest,
  ): Promise<whiteboard.WhiteBoardResponse> {
    const dataSubject = new Subject<whiteboard.WhiteBoardResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.whiteBoardService.getBoard(data).pipe(timeout(5000));
          } else
            return throwError(() => ({
              code: Status.UNAVAILABLE,
              message: 'The service is currently unavailable',
            }));
        }),
        catchError((error) => {
          if (
            (error?.code === Status.UNAVAILABLE ||
              error?.name === 'TimeoutError') &&
            this.isConnected
          )
            this.$connectionSubject.next(false);
          return throwError(() => error);
        }),
        tap((data) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(dataSubject.pipe(map((response) => response)));
    } catch (error) {
      this.logger.error(error.toString());
    }
  }

  async updateBoard(
    data: whiteboard.UpdateWhiteBoardRequest,
  ): Promise<whiteboard.WhiteBoardResponse> {
    const dataSubject = new Subject<whiteboard.WhiteBoardResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.whiteBoardService.updateBoard(data).pipe(timeout(5000));
          } else
            return throwError(() => ({
              code: Status.UNAVAILABLE,
              message: 'The service is currently unavailable',
            }));
        }),
        catchError((error) => {
          if (
            (error?.code === Status.UNAVAILABLE ||
              error?.name === 'TimeoutError') &&
            this.isConnected
          )
            this.$connectionSubject.next(false);
          return throwError(() => error);
        }),
        tap((data) => dataSubject.next(data)),
        tap(() => dataSubject.complete()),
      )
      .subscribe({
        error: (err) => dataSubject.error(err),
      });
    try {
      return await lastValueFrom(dataSubject.pipe(map((response) => response)));
    } catch (error) {
      this.logger.error(error.toString());
    }
  }
}
