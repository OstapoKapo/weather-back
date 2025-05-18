import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
const uri = process.env.MONGO_URL || 'mongodb+srv://ostapokapo:GuB7a0jF33wzGsyh@weather.l8sjq54.mongodb.net/?retryWrites=true&w=majority&appName=weather';

@Module({
  imports:[ 
    ConfigModule.forRoot({
      isGlobal: true, // щоб не імпортувати в кожен модуль
    }),
    MongooseModule.forRoot(uri), ConfigModule.forRoot({isGlobal: true}), UserModule, WeatherModule, AuthModule],
  controllers: [AuthController, UserController],
})
export class AppModule {}
