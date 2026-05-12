export interface TokenPayload {
  sub: string;
  role: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  jwtid: string;
}

export interface TokenResult {
  token: string;
  maxAge: number;
}
