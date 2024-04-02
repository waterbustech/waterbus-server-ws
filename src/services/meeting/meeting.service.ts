import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  BehaviorSubject,
  catchError,
  interval,
  lastValueFrom,
  map,
  Subject,
  Subscription,
  switchMap,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { ClientService } from 'src/models/client-service';
import { meeting } from 'waterbus-proto';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Injectable()
export class MeetingGrpcService implements OnModuleInit {
  private readonly logger: Logger;
  private meetingService: meeting.MeetingService;
  private $connectionSubject: BehaviorSubject<boolean>;
  private isConnected: boolean;
  private $reconnect: Subscription;

  constructor(private readonly meetingClientProxy: ClientGrpc) {
    this.logger = new Logger('MeetingService');
  }

  onModuleInit() {
    this.connect();
    this.$connectionSubject = new BehaviorSubject<boolean>(false);
    this.$connectionSubject.subscribe({
      next: (status) => {
        this.isConnected = status;
        if (!status) {
          this.logger.log('Retry to connect...');
          this.$reconnect = interval(1000)
            .pipe()
            .subscribe({
              next: () => {
                this.logger.log('Connecting...');
                this.connect();
                this.$connectionSubject.next(true);
              },
            });
        } else {
          this.logger.log('Connected');
          this.$reconnect.unsubscribe();
        }
      },
    });
  }

  connect(): void {
    this.meetingService = new ClientService<meeting.MeetingService>(
      this.meetingClientProxy,
      'MeetingService',
    ).getInstance();
  }

  async leaveRoom(data: meeting.LeaveRoomRequest): Promise<boolean> {
    const dataSubject = new Subject<meeting.LeaveRoomResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.meetingService.leaveRoom(data).pipe(timeout(5000));
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
      return await lastValueFrom(
        dataSubject.pipe(map((response) => response.succeed)),
      );
    } catch (error) {
      this.logger.error(error.toString());
    }
  }
}
