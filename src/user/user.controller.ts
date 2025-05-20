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

interface User{
  identifier: string;
  bookmarks: string;
}
interface requestWithUser extends Request {
    user: User
}
  
  @Controller('user')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    @UseGuards(JwtAuthGuard)
    @Get('city')
    async getCity(@Req() req: requestWithUser) {
      const identifier = req.user.identifier;
      return this.userService.getCity(identifier);
    }

    @UseGuards(JwtAuthGuard)
    @Post('city')
    async addCity(@Req() req: requestWithUser, @Body('city') city: string) {
      const identifier = req.user.identifier;
      await this.userService.addCity(identifier, city);
      return await this.userService.getCity(identifier)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('city')
    async deleteCity(@Req() req: requestWithUser, @Body('city') city: string) {
      const identifier = req.user.identifier;
      await this.userService.deleteCity(identifier, city);
      return await this.userService.getCity(identifier)
    }
  }
  