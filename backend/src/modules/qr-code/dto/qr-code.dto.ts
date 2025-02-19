import { z } from "zod";

export const createQRCodeSchema = z
  .object({
    label: z.string().optional(),
  })
  .required();

export type CreateQRCodeDto = z.infer<typeof createQRCodeSchema>;

export const updateQRCodeSchema = z
  .object({
    label: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .required();

export type UpdateQRCodeDto = z.infer<typeof updateQRCodeSchema>;
