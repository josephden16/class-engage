import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import { SubmitResponseDto } from "./dto";

@Injectable()
export class EventEmitterService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emitQuestionResponse(
    sessionId: string,
    dto: SubmitResponseDto,
    optionId: string,
  ) {
    this.server.to(sessionId).emit("questionResponse", {
      questionId: dto.questionId,
      optionId,
    });
  }

  // emitQuestionResponse(
  //   sessionId: string,
  //   dto: SubmitResponseDto,
  //   answer: string,
  //   studentId: string,
  // ) {
  //   this.server.to(sessionId).emit("questionResponse", {
  //     questionId: dto.questionId,
  //     answer,
  //     studentId,
  //   });
  // }

  emitQuestionResults(
    sessionId: string,
    questionId: string,
    results: { [key: string]: number },
  ) {
    this.server.to(sessionId).emit("questionResults", { questionId, results });
  }

  emitStudentQuestionUpdate(sessionId: string, question: any) {
    this.server.to(sessionId).emit("studentQuestionUpdate", question);
  }

  emitStudentUpdate(sessionId: string, student: any) {
    this.server.to(sessionId).emit("studentUpdate", student);
  }

  emitQuestionLaunched(sessionId: string, question: any) {
    this.server.to(sessionId).emit("questionLaunched", question);
  }

  emitStudentKicked(sessionId: string, studentId: string) {
    this.server.to(sessionId).emit("studentKicked", { studentId });
  }

  emitSessionEnded(sessionId: string) {
    this.server.to(sessionId).emit("sessionEnded");
  }
}
