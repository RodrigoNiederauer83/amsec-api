import { EmailService } from "./emailService";
import { ResendEmailService } from "./resendEmailService";

export const emailService: EmailService = new ResendEmailService();