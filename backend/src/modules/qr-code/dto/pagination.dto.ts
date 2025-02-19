import { z } from "zod";

export const paginationSchema = z
  .object({
    page: z
      .string()
      .transform((val) => {
        const number = Number(val);
        if (isNaN(number)) {
          throw new Error("Invalid number");
        }
        return number;
      })
      .refine((val) => val > 0, {
        message: "Page number must be a positive number",
      })
      .optional(),
    limit: z
      .string()
      .transform((val) => {
        const number = Number(val);
        if (isNaN(number)) {
          throw new Error("Invalid number");
        }
        return number;
      })
      .refine((val) => val > 0, {
        message: "Limit must be a positive number",
      })
      .optional(),
    sort: z.string().optional(),
    filter: z.string().optional(),
  })
  .required();

export type PaginationDto = z.infer<typeof paginationSchema>;
