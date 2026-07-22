export interface EmailService {
    send(params: { to: string; subject: string; html: string }): Promise<void>;
}