import { Resend } from "resend";
import { env } from "../config/env";
import { EmailService } from "./emailService";

export class ResendEmailService implements EmailService {
    private client = new Resend(env.RESEND_API_KEY);

    async send({ to, subject, html }: { to: string; subject: string; html: string }) {
        await this.client.emails.send({
            from: env.EMAIL_FROM,
            to,
            subject,
            html,
        });
    }
}