import { render } from "@react-email/render";

import { resend } from "./resend";

const FROM_EMAIL = "LeadXpert <noreply@sushantbabuprasai.com.np>";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export class EmailService {
  async sendWelcome(data: { to: string; userName: string; userEmail: string }) {
    const { WelcomeEmail } =
      await import("../../lib/email/templates/auth/onboarding");

    const html = await render(
      WelcomeEmail({
        userName: data.userName,
        userEmail: data.userEmail,
        dashboardUrl: `${APP_URL}/dashboard`,
      }),
    );

    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Welcome to LeadXpert, ${data.userName}!`,
      html,
    });
  }

  async sendVerificationCode(data: {
    to: string;
    userName: string;
    code: string;
  }) {
    const { VerificationCodeEmail } =
      await import("../../lib/email/templates/auth/VeficationCodeEmail");
    const html = await render(
      VerificationCodeEmail({
        userName: data.userName,
        code: data.code,
      }),
    );
    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: "Verify your email address",
      html,
    });
  }

  async sendPasswordChangedEmail(data: { to: string; userName: string }) {
    const { PasswordChangedEmail } =
      await import("../../lib/email/templates/auth/PasswordChangeEmail");
    const html = await render(
      PasswordChangedEmail({
        userName: data.userName,
        dashboardUrl: `${APP_URL}/dashboard`,
      }),
    );
    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: "Your password was changed",
      html,
    });
  }

  async sendPasswordResetCode(data: {
    to: string;
    userName: string;
    code: string;
  }) {
    const { PasswordResetCodeEmail } =
      await import("../../lib/email/templates/auth/PasswordResetCodeEmail");
    const html = await render(
      PasswordResetCodeEmail({
        userName: data.userName,
        code: data.code,
      }),
    );
    return resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: "Reset your password",
      html,
    });
  }
}
