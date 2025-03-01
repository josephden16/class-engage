import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EventEmitterService } from "./event-emitter.service";
import {
  CreateSessionDto,
  JoinSessionDto,
  SubmitResponseDto,
  SubmitStudentQuestionDto,
  StudentActionDto,
} from "./dto";

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitterService,
  ) {}

  async getSessions(lecturerId: string) {
    return (
      await this.prisma.liveSession.findMany({
        where: { lecturerId },
        include: {
          course: true,
          _count: {
            select: { students: true },
          },
        },
        orderBy: [{ isActive: "desc" }, { startTime: "desc" }],
      })
    ).map((session) => ({
      ...session,
      _count: undefined,
      participants: session._count.students,
    }));
  }

  async createSession(lecturerId: string, dto: CreateSessionDto) {
    const invitationCode = `${dto.courseId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const session = await this.prisma.liveSession.create({
      data: {
        title: dto.title,
        lecturerId,
        courseId: dto.courseId,
        invitationCode,
        questions: {
          create: dto.questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            timeLimit: q.timeLimit,
          })),
        },
      },
      include: { questions: true },
    });
    return session;
  }

  async joinSession(dto: JoinSessionDto) {
    const session = await this.prisma.liveSession.findUnique({
      where: { invitationCode: dto.invitationCode },
    });
    if (!session || !session.isActive)
      throw new NotFoundException("Session not found or not active");

    const studentSession = await this.prisma.studentSession.create({
      data: {
        sessionId: session.id,
        name: dto.name,
        matricNo: dto.matricNo,
      },
    });
    this.eventEmitter.emitStudentUpdate(session.id, studentSession);
    return { sessionId: session.id, studentSessionId: studentSession.id };
  }

  async getSession(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: true,
        students: true,
        questions: true,
        studentQuestions: true,
      },
    });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  // src/sessions/sessions.service.ts

  // async getSession(id: string) {
  //   const session = await this.prisma.liveSession.findUnique({
  //     where: { id },
  //     include: {
  //       course: true,
  //       students: true,
  //       questions: { include: { responses: true } },
  //       studentQuestions: true,
  //     },
  //   });
  //   if (!session) throw new NotFoundException("Session not found");

  //   const questionsWithDetails = session.questions.map((q) => {
  //     const timeRemaining = q.endedAt
  //       ? 0
  //       : Math.max(
  //           0,
  //           q.timeLimit -
  //             Math.floor((Date.now() - new Date(q.createdAt).getTime()) / 1000),
  //         );
  //     const isActive = q.isLaunched && timeRemaining > 0;
  //     const responseRate =
  //       (q.responses.length / session.students.length) * 100 || 0;

  //     return {
  //       ...q,
  //       timeRemaining,
  //       isActive,
  //       responseRate,
  //       options:
  //         q.type === "MCQ" || q.type === "TRUE_FALSE"
  //           ? q.type === "TRUE_FALSE"
  //             ? [
  //                 {
  //                   id: "True",
  //                   text: "True",
  //                   votes: q.responses.filter((r) => r.answer === "True")
  //                     .length,
  //                 },
  //                 {
  //                   id: "False",
  //                   text: "False",
  //                   votes: q.responses.filter((r) => r.answer === "False")
  //                     .length,
  //                 },
  //               ]
  //             : q.options.map((opt, idx) => ({
  //                 id: String.fromCharCode(65 + idx),
  //                 text: opt,
  //                 votes: q.responses.filter((r) => r.answer === opt).length,
  //               }))
  //           : [],
  //       responses: q.responses.map((r) => ({
  //         studentId: r.studentId,
  //         answer: r.answer,
  //       })),
  //     };
  //   });

  //   return {
  //     ...session,
  //     questions: questionsWithDetails,
  //     isActive: session.isActive, // Already part of your schema
  //   };
  // }

  async getStudentStats(id: string, studentSessionId: string) {
    const responses = await this.prisma.response.count({
      where: { studentId: studentSessionId, question: { sessionId: id } },
    });
    const total = await this.prisma.question.count({
      where: { sessionId: id },
    });
    return { answered: responses, total };
  }

  async startSession(id: string) {
    return this.prisma.liveSession.update({
      where: { id },
      data: { isActive: true, startTime: new Date() },
    });
  }

  async endSession(id: string) {
    const session = await this.prisma.liveSession.update({
      where: { id },
      data: { isActive: false, endTime: new Date() },
    });
    this.eventEmitter.emitSessionEnded(id); // Notify all students
    return session;
  }

  // async submitResponse(
  //   sessionId: string,
  //   studentSessionId: string,
  //   dto: SubmitResponseDto,
  // ) {
  //   const question = await this.prisma.question.findUnique({
  //     where: { id: dto.questionId, sessionId },
  //   });
  //   if (!question) throw new NotFoundException("Question not found");
  //   const response = await this.prisma.response.create({
  //     data: {
  //       questionId: dto.questionId,
  //       studentId: studentSessionId,
  //       answer: dto.answer,
  //     },
  //   });

  //   // Emit response with answer for all types
  //   this.eventEmitter.emitQuestionResponse(sessionId, dto, dto.answer);

  //   const studentCount = await this.prisma.studentSession.count({
  //     where: { sessionId },
  //   });
  //   const responseCount = await this.prisma.response.count({
  //     where: { questionId: dto.questionId },
  //   });
  //   if (responseCount === studentCount) {
  //     const responses = await this.prisma.response.findMany({
  //       where: { questionId: dto.questionId },
  //     });
  //     const results = responses.reduce((acc, r) => {
  //       acc[r.answer] = (acc[r.answer] || 0) + 1;
  //       return acc;
  //     }, {});
  //     this.eventEmitter.emitQuestionResults(sessionId, dto.questionId, results);
  //   }
  //   return response;
  // }

  // src/sessions/sessions.service.ts
  async submitResponse(
    sessionId: string,
    studentSessionId: string,
    dto: SubmitResponseDto,
  ) {
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId, sessionId },
    });
    if (!question) throw new NotFoundException("Question not found");
    const response = await this.prisma.response.create({
      data: {
        questionId: dto.questionId,
        studentId: studentSessionId,
        answer: dto.answer,
      },
    });

    // Emit response with full details
    this.eventEmitter.emitQuestionResponse(sessionId, dto, dto.answer);

    const studentCount = await this.prisma.studentSession.count({
      where: { sessionId },
    });
    const responseCount = await this.prisma.response.count({
      where: { questionId: dto.questionId },
    });
    if (responseCount === studentCount) {
      const responses = await this.prisma.response.findMany({
        where: { questionId: dto.questionId },
      });
      const results = responses.reduce((acc, r) => {
        acc[r.answer] = (acc[r.answer] || 0) + 1;
        return acc;
      }, {});
      this.eventEmitter.emitQuestionResults(sessionId, dto.questionId, results);
    }
    return response;
  }

  async submitStudentQuestion(
    sessionId: string,
    studentSessionId: string,
    dto: SubmitStudentQuestionDto,
  ) {
    const question = await this.prisma.studentQuestion.create({
      data: {
        sessionId,
        studentSessionId,
        text: dto.text,
      },
    });
    this.eventEmitter.emitStudentQuestionUpdate(sessionId, question);
    return question;
  }

  async upvoteStudentQuestion(
    sessionId: string,
    questionId: string,
    studentSessionId: string,
  ) {
    const existingUpvote = await this.prisma.upvote.findUnique({
      where: {
        studentSessionId_studentQuestionId: {
          studentSessionId,
          studentQuestionId: questionId,
        },
      },
    });
    if (existingUpvote)
      throw new Error("You have already upvoted this question");

    await this.prisma.upvote.create({
      data: {
        studentSessionId,
        studentQuestionId: questionId,
      },
    });
    const question = await this.prisma.studentQuestion.update({
      where: { id: questionId, sessionId },
      data: { upvotes: { increment: 1 } },
    });
    this.eventEmitter.emitStudentQuestionUpdate(sessionId, question);
    return question;
  }
  async toggleAnswered(sessionId: string, questionId: string) {
    const question = await this.prisma.studentQuestion.findUnique({
      where: { id: questionId, sessionId },
    });
    if (!question) throw new NotFoundException("Student question not found");

    const updatedQuestion = await this.prisma.studentQuestion.update({
      where: { id: questionId },
      data: { isAnswered: question.isAnswered ? false : true },
    });
    this.eventEmitter.emitStudentQuestionUpdate(sessionId, updatedQuestion);
    return updatedQuestion;
  }

  async studentAction(
    sessionId: string,
    studentId: string,
    dto: StudentActionDto,
  ) {
    if (dto.action === "kick") {
      const student = await this.prisma.studentSession.delete({
        where: { id: studentId, sessionId },
      });
      this.eventEmitter.emitStudentUpdate(sessionId, student);
      this.eventEmitter.emitStudentKicked(sessionId, studentId);
      return student;
    }
    throw new Error("Unsupported action");
  }

  private async getActiveQuestionIds(sessionId: string): Promise<string[]> {
    const questions = await this.prisma.question.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });
    return questions.map((q) => q.id);
  }

  async getStudentSession(id: string, studentSessionId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: true,
        students: true,
        questions: {
          where: {
            id: { in: await this.getActiveQuestionIds(id) },
            isLaunched: true,
          },
        },
        studentQuestions: true,
      },
    });
    if (!session) throw new NotFoundException("Session not found");
    const student = await this.prisma.studentSession.findUnique({
      where: { id: studentSessionId },
    });
    if (!student || student.sessionId !== id)
      throw new NotFoundException("Student not in session");
    const currentQuestion = session.questions[0]
      ? {
          ...session.questions[0],
          timeRemaining: session.questions[0].endedAt
            ? 0
            : Math.max(
                0,
                session.questions[0].timeLimit -
                  Math.floor(
                    (Date.now() -
                      new Date(session.questions[0].createdAt).getTime()) /
                      1000,
                  ),
              ),
        }
      : null;
    return { ...session, currentQuestion };
  }

  async launchQuestion(sessionId: string, questionId: string) {
    const question = await this.prisma.question.update({
      where: { id: questionId, sessionId },
      data: { isLaunched: true },
    });
    if (!question) throw new NotFoundException("Question not found");
    this.eventEmitter.emitQuestionLaunched(sessionId, question);
    setTimeout(async () => {
      const responses = await this.prisma.response.findMany({
        where: { questionId: question.id },
      });
      const results = responses.reduce((acc, r) => {
        acc[r.answer] = (acc[r.answer] || 0) + 1;
        return acc;
      }, {});
      await this.prisma.question.update({
        where: { id: questionId },
        data: { endedAt: new Date() },
      });
      this.eventEmitter.emitQuestionResults(sessionId, question.id, results);
    }, question.timeLimit * 1000);
    return question;
  }

  async getSessionAnalytics(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
      include: {
        course: true,
        students: true,
        questions: { include: { responses: true } },
        studentQuestions: true,
        pollResponses: true,
      },
    });
    if (!session) throw new NotFoundException("Session not found");
    if (session.isActive)
      throw new Error("Session must be ended to view analytics");

    const durationMs =
      session.endTime && session.startTime
        ? new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime()
        : 0;
    const duration = `${Math.floor(durationMs / 3600000)}h ${Math.floor((durationMs % 3600000) / 60000)}m`;

    const questions = session.questions.map((q) => ({
      id: q.id,
      text: q.text,
      responseRate: (q.responses.length / session.students.length) * 100 || 0,
    }));

    const pollResults = await this.prisma.pollResponse.groupBy({
      by: ["answer"],
      where: { sessionId: id },
      _count: { answer: true },
    });
    const totalResponses = pollResults.reduce(
      (sum, r) => sum + r._count.answer,
      0,
    );
    const pollData = pollResults.map((r) => ({
      name: r.answer,
      value: totalResponses > 0 ? (r._count.answer / totalResponses) * 100 : 0,
    }));

    const topQuestions = session.studentQuestions
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3)
      .map((q) => ({
        id: q.id,
        text: q.text,
        upvotes: q.upvotes,
        answer: "Answered by lecturer",
      }));

    return {
      title: session.title,
      date: session.startTime.toISOString().split("T")[0],
      duration,
      participants: session.students.length,
      questions,
      pollResults:
        pollData.length > 0
          ? pollData
          : [
              { name: "Very Helpful", value: 0 },
              { name: "Somewhat Helpful", value: 0 },
              { name: "Neutral", value: 0 },
              { name: "Not Helpful", value: 0 },
            ],
      topQuestions,
    };
  }

  async submitPollResponse(
    sessionId: string,
    studentSessionId: string,
    answer: string,
  ) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException("Session not found");

    // Check if studentSessionId exists
    const studentSession = await this.prisma.studentSession.findUnique({
      where: { id: studentSessionId },
    });

    console.log(studentSession);

    if (!studentSession || studentSession.sessionId !== sessionId) {
      throw new NotFoundException("Invalid or expired student session");
    }

    const existingResponse = await this.prisma.pollResponse.findFirst({
      where: {
        studentSessionId,
        sessionId,
      },
    });
    if (existingResponse)
      throw new Error("You have already submitted feedback for this session");

    return this.prisma.pollResponse.create({
      data: {
        sessionId,
        studentSessionId,
        answer,
      },
    });
  }
}
