import { z } from "zod";

export const CreateSessionSchema = z.object({
  title: z.string(),
  courseId: z.string(),
  questions: z.array(
    z.object({
      text: z.string(),
      type: z.enum(["MCQ", "TRUE_FALSE", "OPEN_ENDED", "FORMULA"]),
      options: z.array(z.string()),
      timeLimit: z.number(),
    }),
  ),
});
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;

export const JoinSessionSchema = z.object({
  invitationCode: z.string(),
  name: z.string(),
  matricNo: z.string(),
});
export type JoinSessionDto = z.infer<typeof JoinSessionSchema>;

export const SubmitResponseSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
});
export type SubmitResponseDto = z.infer<typeof SubmitResponseSchema>;

export const SubmitStudentQuestionSchema = z.object({
  text: z.string(),
});
export type SubmitStudentQuestionDto = z.infer<
  typeof SubmitStudentQuestionSchema
>;

export const StudentActionSchema = z.object({
  action: z.literal("kick"), // Can be extended with .union([z.literal('mute'), ...]) for more actions
});
export type StudentActionDto = z.infer<typeof StudentActionSchema>;
