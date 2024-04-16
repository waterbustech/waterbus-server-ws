import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import SocketEvent from 'src/domain/constants/socket_events';
import { SocketGateway } from 'src/infrastructure/gateways/socket/socket.gateway';
import { chat } from 'waterbus-proto';

@Controller()
export class ChatGrpcController implements chat.ChatService {
  constructor(private readonly socketGateway: SocketGateway) {}

  @GrpcMethod('ChatService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('ChatService', 'sendMessage')
  sendMessage(data: chat.MessageRequest): Observable<chat.MessageResponse> {
    try {
      this.socketGateway.emitTo({
        data,
        room: data.meeting.toString(),
        event: SocketEvent.sendMessageSSC,
      });

      const response: chat.MessageResponse = {
        succeed: true,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: chat.MessageResponse = {
        succeed: false,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }

  @GrpcMethod('ChatService', 'updateMessage')
  updateMessage(data: chat.MessageRequest): Observable<chat.MessageResponse> {
    try {
      this.socketGateway.emitTo({
        data,
        room: data.meeting.toString(),
        event: SocketEvent.updateMessageSSC,
      });

      const response: chat.MessageResponse = {
        succeed: true,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: chat.MessageResponse = {
        succeed: false,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }

  @GrpcMethod('ChatService', 'deleteMessage')
  deleteMessage(data: chat.MessageRequest): Observable<chat.MessageResponse> {
    try {
      this.socketGateway.emitTo({
        data,
        room: data.meeting.toString(),
        event: SocketEvent.deleteMessageSSC,
      });

      const response: chat.MessageResponse = {
        succeed: true,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: chat.MessageResponse = {
        succeed: false,
      };

      return new Observable<chat.MessageResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }
}
