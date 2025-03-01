import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string(),
  courseCode: z.string(),
  description: z.string().optional(),
});
export type CreateCourseDto = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;
