export interface IMailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

export interface ISendMailParams {
  to: string;
  subject: string;
  html: string;
}

export interface ISendPasswordResetParams {
  to: string;
  name: string;
  password: string;
}

export interface IMailService {
  sendMail(params: ISendMailParams): Promise<void>;
  sendPasswordReset(params: ISendPasswordResetParams): Promise<void>;
}
