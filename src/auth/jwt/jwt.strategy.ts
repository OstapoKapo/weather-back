import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    console.log('req.cookies', req.cookies);
    token = req.cookies['token'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
       name: 'jwt'
    });
  }

  async validate(payload: any) {
    console.log('JWT payload', payload);
    return { identifier: payload.identifier };
  }
}
