export interface IAuthUser {
  id: number;
  email: string;
}

export interface IAuthTokenPayload {
  sub: string | number;
  email: string;
  iat?: number;
  exp?: number;
}
