import { z } from "zod";

export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  OTP = 'otp'
}

export const createTokenSchema = z.object({
  user_id: z
    .string(),
  token: z.string().min(1),
  type: z.enum(["email_verification", "password_reset", "otp"]),
  expires_at: z.coerce.date(),
});

export type CreateTokenType = z.infer<typeof createTokenSchema>;
