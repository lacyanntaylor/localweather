import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
interface Weather {
  id: string;
  url: string;
  designation: string;
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
  }

  // Fetch location data based on a query
  private async fetchLocationData(query: string): Promise<any> {
    const queryURL = `${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`;
    const response = await fetch(queryURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  }

  // Destructure the location data to extract coordinates
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon,
    };
  }

  // Build the geocode query for fetching location data
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // Build the weather query URL
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(this.buildGeocodeQuery(city));
    return this.destructureLocationData(locationData[0]); // Assuming the first result is the correct one
  }

  // Fetch weather data for the given coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    return await this.fetchLocationData(this.buildWeatherQuery(coordinates));
  }

  // Parse current weather from the API response
  private parseCurrentWeather(response: any): Weather {
    return {
      id: response.weather[0].id,
      url: response.weather[0].icon,
      designation: response.weather[0].main,
    };
  }

  // Build the forecast array based on the current weather data
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    return weatherData.map((data: any) => ({
      id: data.weather[0].id,
      url: data.weather[0].icon,
      designation: data.weather[0].main,
    }));
  }

  // Get weather for a city by its name
  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);

      // Parse current weather
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Build forecast array
      const forecast = this.buildForecastArray(currentWeather, weatherData.list || []);

      return { currentWeather, forecast };
    } catch (err) {
      console.error('Error getting weather data:', err);
      throw new Error('Failed to fetch weather data');
    }
  }
}

export default new WeatherService();
