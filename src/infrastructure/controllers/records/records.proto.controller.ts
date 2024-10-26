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
      const isSucceed = this.rtcManager.startRecord({
        roomId: data.meetingId,
        recordId: data.recordId,
      });

      const response: recordtrack.RecordResponse = {
        succeed: isSucceed,
        recordId: data.recordId,
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
      const res = this.rtcManager.stopRecord({
        roomId: data.meetingId,
      });

      let response: recordtrack.RecordResponse = {
        succeed: false,
        recordId: null,
      };

      if (res) {
        response = {
          succeed: true,
          recordId: res.recordId,
        };
      }
      observer.next(response);
      observer.complete();
    });
  }
}
