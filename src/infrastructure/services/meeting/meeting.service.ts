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
    this.logger = new Logger(MeetingGrpcService.name);
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
    this.meetingService = new ClientService<meeting.MeetingService>(
      this.meetingClientProxy,
      'MeetingService',
    ).getInstance();
  }

  private checkConnection(): void {
    this.meetingService
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

  async getParticipantById(
    data: meeting.GetParticipantRequest,
  ): Promise<meeting.GetParticipantResponse> {
    const dataSubject = new Subject<meeting.GetParticipantResponse>();
    this.$connectionSubject
      .pipe(
        switchMap((isConnected) => {
          if (isConnected) {
            return this.meetingService
              .getParticipantById(data)
              .pipe(timeout(5000));
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
