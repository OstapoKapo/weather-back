import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}


  createToken(identifier: string) {
    return this.jwtService.sign({ identifier });
  }

 
  verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
