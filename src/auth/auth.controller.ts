import { Controller, Get, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { randomUUID } from 'crypto';

interface requestWithUser extends Request {
    user: {
        identifier: string;
        bookmarks: string;
        _id: string;
    }
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
) {}

@Get('init')
async init(@Req() req, @Res({ passthrough: true }) res) {
 
  const token = req.cookies?.token;
  let user;

  if (token) {
    try {
      const payload = this.authService.verifyToken(token);
      user = await this.userService.findByIdentifier(payload.identifier);
    } catch (e) {
      user = null;
    }
  }

  if (!user) {
    const newIdentifier = randomUUID();
    user = await this.userService.createUser(newIdentifier);

    const newToken = this.authService.createToken(user.identifier);
    res.cookie('token', newToken, {
      secure: true, 
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  console.log('user', user);    

  return { user };
}
}
