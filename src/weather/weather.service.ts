import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cacheManager from 'cache-manager';
import { Cache } from 'cache-manager';

interface Coordinates {
  lat: number;
  lon: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.WEATHER_API_KEY;
  private readonly weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  private cache: Cache;

  constructor() {
    this.cache = cacheManager.caching({ store: 'memory', ttl: 3600 }); // 1 година
  }

  async getCoordinates(city: string): Promise<Coordinates> {
    const url = `${this.weatherUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      const { coord } = response.data;
      return coord;
    } catch (error) {
      console.error('Error fetching coordinates:', error.response?.data || error.message);
      throw new Error('Could not fetch city coordinates');
    }
  }

  async getWeather(lat: number, lon: number) {
    const cacheKey = `weather-${lat}-${lon}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      console.log('Returning cached data');
      return cached;
    }

    try {
      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${this.weatherUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`),
        axios.get(`${this.forecastUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`)
      ]);

      const data = {
        currentDay: currentRes.data,
        forecast: forecastRes.data.list.slice(0, 8), // наступні 24 години (8 * 3год)
      };

      await this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error.response?.data || error.message);
      throw new Error('Could not fetch weather data');
    }
  }

  async getWeatherByCity(city: string) {
    try {
      const { lat, lon } = await this.getCoordinates(city);
      const weatherData = await this.getWeather(lat, lon);

      return {
        currentDay: weatherData.currentDay,
        hourlyForecast: weatherData.forecast,
      };
    } catch (error) {
      console.error('Error fetching weather by city:', error.response?.data || error.message);
      throw new Error('Could not fetch weather by city');
    }
  }
}
