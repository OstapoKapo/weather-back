import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cacheManager from 'cache-manager';
import { Cache } from 'cache-manager';

interface Coordinates {
  lat: number;
  lon: number;
}

interface DailyTemperature {
  maxTemp: number;
  minTemp: number;
}

@Injectable()
export class WeatherService {
  private readonly apiKey = process.env.WEATHER_API_KEY;
  private readonly rapidApiKey = process.env.RAPID_API_KEY;
  private readonly weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private readonly forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  private readonly cityUrl = 'http://api.openweathermap.org/geo/1.0/reverse';
  private readonly citiesUrl = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';

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

      const forecastList = forecastRes.data.list;

      const dailyForecast: { maxTemp: number; minTemp: number; main: string, icon: string, day: string }[] = [];
  
      for (let i = 0; i < forecastList.length; i += 8) {
        const dayChunk = forecastList.slice(i, i + 8);
        if (dayChunk.length < 8) break;
  
        const temps = dayChunk.map((entry: any) => entry.main.temp);
        const weatherTypes = dayChunk.map((entry: any) => entry.weather[0].main);
        const weatherIcons = dayChunk.map((entry: any) => entry.weather[0].icon);

        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
  
        // Найчастіша подія (main)
        const main = weatherTypes
          .sort((a, b) =>
            weatherTypes.filter(v => v === a).length - weatherTypes.filter(v => v === b).length
          )
          .pop()!;
          
        const icon = weatherIcons
          .sort((a, b) =>
            weatherIcons.filter(v => v === a).length - weatherIcons.filter(v => v === b).length
          )
          .pop()!;
      
        // День тижня
        const date = new Date(dayChunk[0].dt_txt);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      
        dailyForecast.push({ maxTemp, minTemp, main, icon, day });
      }

      const todayChunk = forecastList.slice(0, 8);
const todayTemps = todayChunk.map((entry: any) => entry.main.temp);
const todayMaxTemp = Math.max(...todayTemps);
const todayMinTemp = Math.min(...todayTemps);

// Додаємо high/low temp в currentDay
currentRes.data.todayHighLow = {
  max: todayMaxTemp,
  min: todayMinTemp
};   
  
      const data = {
        currentDay: currentRes.data,
        forecast: forecastList.slice(0, 8),
        forecast5Days: dailyForecast 
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
     ;

      return {
        currentDay: weatherData.currentDay,
        hourlyForecast: weatherData.forecast,
        forecast5Days:weatherData.forecast5Days,  
      };
    } catch (error) {
      console.error('Error fetching weather by city:', error.response?.data || error.message);
      throw new Error('Could not fetch weather by city');
    }
  }

  async getCityByCord(lat: string, lon: string) {
    try{
        const response = await axios.get(`${this.cityUrl}?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`);
        return response.data; // назва міста
    }catch (error) {
        console.error('Error fetching city by cord:', error.response?.data || error.message);
        throw new Error('Could not fetch city by cord');
    }
  }

  async getAllCities(query:string) {
    try{
        const response = await axios.get(`${this.citiesUrl}`, {
            params: {
              namePrefix: query,
              limit: 5
            },
            headers: {
              'X-RapidAPI-Key': `${this.rapidApiKey}`,
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        })
        return response.data.data
    }catch (error) {
        console.error('Error fetching cities:', error.response?.data || error.message);
        throw new Error('Could not fetch cities');
    }
  }
}
