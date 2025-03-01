import { Module } from "@nestjs/common";
import { SessionsService } from "./session.service";
import { SessionsController } from "./session.controller";
import { SessionsGateway } from "./session.gateway";
import { EventEmitterService } from "./event-emitter.service";

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionsGateway, EventEmitterService],
  exports: [SessionsService],
})
export class SessionsModule {}
