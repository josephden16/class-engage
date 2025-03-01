import { Controller, Get, Post, Body, Param, Headers } from "@nestjs/common";
import { SessionsService } from "./session.service";
import {
  CreateSessionDto,
  JoinSessionDto,
  SubmitResponseDto,
  SubmitStudentQuestionDto,
  StudentActionDto,
  CreateSessionSchema,
  JoinSessionSchema,
  SubmitResponseSchema,
  SubmitStudentQuestionSchema,
  StudentActionSchema,
} from "./dto";
import { AllowAuthenticated, GetUser } from "src/shared/auth/auth.decorator";
import { ZodValidationPipe } from "src/pipes/zodValidation.pipe";
import { AuthenticatedUser } from "src/shared/types";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @AllowAuthenticated()
  create(
    @Body(new ZodValidationPipe(CreateSessionSchema)) dto: CreateSessionDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.sessionsService.createSession(user.id, dto);
  }

  @Get()
  @AllowAuthenticated()
  getSessions(@GetUser() user: AuthenticatedUser) {
    return this.sessionsService.getSessions(user.id);
  }

  @Post("join")
  join(@Body(new ZodValidationPipe(JoinSessionSchema)) dto: JoinSessionDto) {
    return this.sessionsService.joinSession(dto);
  }

  @Get(":id")
  @AllowAuthenticated()
  getSession(@Param("id") id: string) {
    return this.sessionsService.getSession(id);
  }

  @Get(":id/student")
  getStudentSession(
    @Param("id") id: string,
    @Headers("x-student-session-id") studentSessionId: string,
  ) {
    return this.sessionsService.getStudentSession(id, studentSessionId);
  }

  @Get(":id/student/stats")
  getStudentStats(
    @Param("id") id: string,
    @Headers("x-student-session-id") studentSessionId: string,
  ) {
    return this.sessionsService.getStudentStats(id, studentSessionId);
  }

  @Post(":id/start")
  @AllowAuthenticated()
  startSession(@Param("id") id: string) {
    return this.sessionsService.startSession(id);
  }

  @Post(":id/end")
  @AllowAuthenticated()
  endSession(@Param("id") id: string) {
    return this.sessionsService.endSession(id);
  }

  @Post(":id/questions/:questionId/launch")
  @AllowAuthenticated()
  launchQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
  ) {
    return this.sessionsService.launchQuestion(id, questionId);
  }

  @Post(":id/responses")
  submitResponse(
    @Param("id") id: string,
    @Headers("x-student-session-id") studentSessionId: string,
    @Body(new ZodValidationPipe(SubmitResponseSchema)) dto: SubmitResponseDto,
  ) {
    return this.sessionsService.submitResponse(id, studentSessionId, dto);
  }

  @Post(":id/student-questions")
  submitStudentQuestion(
    @Param("id") id: string,
    @Headers("x-student-session-id") studentSessionId: string,
    @Body(new ZodValidationPipe(SubmitStudentQuestionSchema))
    dto: SubmitStudentQuestionDto,
  ) {
    return this.sessionsService.submitStudentQuestion(
      id,
      studentSessionId,
      dto,
    );
  }

  @Post(":id/student-questions/:questionId/upvote")
  upvoteStudentQuestion(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
    @Headers("x-student-session-id") studentSessionId: string,
  ) {
    return this.sessionsService.upvoteStudentQuestion(
      id,
      questionId,
      studentSessionId,
    );
  }

  @Post(":id/student-questions/:questionId/toggle-answered")
  @AllowAuthenticated()
  toggleAnswered(
    @Param("id") id: string,
    @Param("questionId") questionId: string,
  ) {
    return this.sessionsService.toggleAnswered(id, questionId);
  }

  @Post(":id/students/:studentId/action")
  @AllowAuthenticated()
  studentAction(
    @Param("id") id: string,
    @Param("studentId") studentId: string,
    @Body(new ZodValidationPipe(StudentActionSchema)) dto: StudentActionDto,
  ) {
    return this.sessionsService.studentAction(id, studentId, dto);
  }

  @Get(":id/analytics")
  @AllowAuthenticated()
  getSessionAnalytics(@Param("id") id: string) {
    return this.sessionsService.getSessionAnalytics(id);
  }

  @Post(":id/poll")
  submitPoll(
    @Param("id") id: string,
    @Headers("x-student-session-id") studentSessionId: string,
    @Body() { answer }: { answer: string },
  ) {
    return this.sessionsService.submitPollResponse(
      id,
      studentSessionId,
      answer,
    );
  }
}
