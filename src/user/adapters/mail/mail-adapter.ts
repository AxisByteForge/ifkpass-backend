export interface MailServiceAdapter {
  send(props: { email: string; verifyCode: string }): Promise<void>;
}
