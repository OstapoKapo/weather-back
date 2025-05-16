import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @Get('forecast')
    async getWeather(@Query('city') city: string) {
      const weatherData = await this.weatherService.getWeatherByCity(city);
      
      const { currentDay, hourlyForecast, forecast5Days } = weatherData;
  
      return {
        currentDay,
        hourlyForecast,
        forecast5Days
      };
    }

    @Get('city')
    async getCity(
        @Query('lat') lat: string,
        @Query('lon') lon: string
      ) {
        const city = await this.weatherService.getCityByCord(lat, lon);
      
        return city ;
    }

    @Get('fetchCities')
    async fetchCities(@Query('query') query: string) {
        const cities = await this.weatherService.getAllCities(query);
        return cities;
    }

}
