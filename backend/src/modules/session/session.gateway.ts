import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import { EventEmitterService } from "./event-emitter.service";

@WebSocketGateway({ cors: { origin: "*" } })
@Injectable()
export class SessionsGateway {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.eventEmitter.setServer(server);
  }

  constructor(private readonly eventEmitter: EventEmitterService) {}

  @SubscribeMessage("joinSession")
  handleJoinSession(
    @MessageBody() sessionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(sessionId);
    return { event: "joined", sessionId };
  }
}
