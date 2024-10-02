import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { WebRTCManager } from 'src/infrastructure/services/sfu/webrtc_manager';
import { recordtrack } from 'waterbus-proto';

@Controller()
export class RecordGrpcController implements recordtrack.RecordService {
  constructor(private readonly rtcManager: WebRTCManager) {}

  @GrpcMethod('RecordService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('RecordService', 'startRecord')
  startRecord(
    data: recordtrack.StartRecordRequest,
  ): Observable<recordtrack.RecordResponse> {
    return new Observable<recordtrack.RecordResponse>((observer) => {
      const response: recordtrack.RecordResponse = {
        succeed: false,
        recordId: null,
      };
      observer.next(response);
      observer.complete();
    });
  }

  @GrpcMethod('RecordService', 'stopRecord')
  stopRecord(
    data: recordtrack.StopRecordRequest,
  ): Observable<recordtrack.RecordResponse> {
    return new Observable<recordtrack.RecordResponse>((observer) => {
      const response: recordtrack.RecordResponse = {
        succeed: false,
        recordId: null,
      };
      observer.next(response);
      observer.complete();
    });
  }
}
