import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Minimum review rating is 1")
    .max(5, "Maximum review rating is 5"),
  comment: z.string().optional(),
  qrCodeId: z.string({ required_error: "QR code ID is required" }),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
