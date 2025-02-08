import dayjs from 'dayjs';
import dotenv from 'dotenv';

dotenv.config();

class Weather {
    constructor(
        public city,
        public date,
        public tempF,
        public windSpeed,
        public humidity,
        public icon,
        public iconDescription
    ) {}
}

class WeatherService {
    constructor() {
        this.city = '';
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.API_KEY || '';

        if (!this.baseURL || !this.apiKey) {
            throw new Error('API base URL or API key is missing');
        }
    }

    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    buildURL(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        params.appid = this.apiKey;
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return url.toString();
    }

    async getCoordinates(city) {
        const url = this.buildURL('/geo/1.0/direct', { q: city, limit: 1 });
        const data = await this.fetchJSON(url);
        if (!data.length) throw new Error('City not found');
        return data[0];
    }

    async getWeatherData({ lat, lon }) {
        const url = this.buildURL('/data/2.5/forecast', { lat, lon, units: 'imperial' });
        const data = await this.fetchJSON(url);
        return this.processWeatherData(data);
    }

    processWeatherData(data) {
        if (!data.list || !data.list.length) throw new Error('Weather data not available');

        const forecast = data.list
            .filter(entry => entry.dt_txt.includes('12:00:00')) // Get midday forecasts
            .map(entry => this.createWeatherObject(entry));

        return [this.createWeatherObject(data.list[0]), ...forecast];
    }

    createWeatherObject(entry) {
        return new Weather(
            this.city,
            dayjs.unix(entry.dt).format('M/D/YYYY'),
            entry.main.temp,
            entry.wind.speed,
            entry.main.humidity,
            entry.weather[0].icon,
            entry.weather[0].description || entry.weather[0].main
        );
    }

    async getWeatherForCity(city) {
        try {
            this.city = city;
            const coordinates = await this.getCoordinates(city);
            return await this.getWeatherData(coordinates);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default new WeatherService();
