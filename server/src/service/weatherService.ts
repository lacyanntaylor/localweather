import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

interface Weather {
  id: string;
  url: string;
  designation: string;
}

class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org'; // Ensure baseURL is set
    this.apiKey = process.env.API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Missing API key. Set API_KEY in .env file.');
    }
  }

  private async fetchLocationData(query: string): Promise<any> {
    const queryURL = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const response = await fetch(queryURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch location data: ${response.statusText}`);
    }
    return response.json();
  }

  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Coordinates not found in location data');
    }
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const queryURL = this.buildWeatherQuery(coordinates);
    const response = await fetch(queryURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    return response.json();
  }

  private parseCurrentWeather(response: any): Weather {
    if (!response.weather || response.weather.length === 0) {
      throw new Error('Invalid weather data received');
    }
    return {
      id: response.weather[0].id,
      url: `https://openweathermap.org/img/wn/${response.weather[0].icon}.png`,
      designation: response.weather[0].main,
    };
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    return weatherData.map((data: any) => ({
      id: data.weather[0].id,
      url: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      designation: data.weather[0].main,
    }));
  }

  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);

      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecast = this.buildForecastArray(weatherData.list || []);

      return { currentWeather, forecast };
    } catch (err) {
      console.error('Error getting weather data:', err);
      throw new Error('Failed to fetch weather data');
    }
  }
}

export default new WeatherService();
