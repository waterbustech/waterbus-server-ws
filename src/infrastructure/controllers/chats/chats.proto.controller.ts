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
        socketIds: data.ccus,
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
        socketIds: data.ccus,
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
        socketIds: data.ccus,
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

  @GrpcMethod('ChatService', 'newMemberJoined')
  newMemberJoined(
    data: chat.NewMemberJoinedRequest,
  ): Observable<chat.MessageResponse> {
    try {
      const payload = {
        member: data.member,
        meetingId: data.meetingId,
      };

      this.socketGateway.emitTo({
        data: payload,
        room: null,
        event: SocketEvent.newMemberJoinedSSC,
        socketIds: data.ccus,
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

  @GrpcMethod('ChatService', 'newInvitation')
  newInvitation(
    data: chat.NewInvitationRequest,
  ): Observable<chat.MessageResponse> {
    try {
      const payload = {
        meeting: data.room,
      };

      this.socketGateway.emitTo({
        data: payload,
        room: null,
        event: SocketEvent.newInvitationSSC,
        socketIds: data.ccus,
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
