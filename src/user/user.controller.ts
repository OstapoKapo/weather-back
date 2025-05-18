import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { UserService } from './user.service';
  import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
  import { Request } from 'express';


interface requestWithUser extends Request {
    user: {
        identifier: string;
        bookmarks: string;
    }
}
  
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get('city')
    async getBookmarks(@Req() req: requestWithUser) {
      const identifier = (req.user as any).identifier;
      return this.userService.getBookmarks(identifier);
    }

    @UseGuards(JwtAuthGuard)
    @Post('city')
    async addBookmark(@Req() req: requestWithUser, @Body('city') city: string) {
      const identifier = (req.user as any).identifier;
      await this.userService.addBookmark(identifier, city);
      return await this.userService.getBookmarks(identifier)
    }
  }
  