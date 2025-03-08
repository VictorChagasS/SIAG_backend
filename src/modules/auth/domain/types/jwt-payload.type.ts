export interface IJwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
