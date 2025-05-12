import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
const uri = process.env.MONGO_URL || 'mongodb+srv://ostapokapo:GuB7a0jF33wzGsyh@weather.l8sjq54.mongodb.net/?retryWrites=true&w=majority&appName=weather';

@Module({
  imports:[ MongooseModule.forRoot(uri), ConfigModule.forRoot({isGlobal: true}), UserModule, WeatherModule],
})
export class AppModule {}
