import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @Get('forecast')
    async getWeather(@Query('city') city: string) {
      const weatherData = await this.weatherService.getWeatherByCity(city);
      
      const { currentDay, hourlyForecast } = weatherData;
  
      return {
        currentDay,
        hourlyForecast,
      };
    }
}
