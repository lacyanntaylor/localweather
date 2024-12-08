import fs from 'fs/promises';
import path from 'path';

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(name: string, id: string) {
    this.id = id;
    this.name = name;
  }
}

class HistoryService {
  private filePath: string;

  constructor() {
    this.filePath = path.resolve('db/db.json');
  }

  // Read method: Reads data from the searchHistory.json file
  private async read(): Promise<string> {
    try {
      return await fs.readFile(this.filePath, { encoding: 'utf8' });
    } catch (err) {
      if (err.code === 'ENOENT') {
        // If file doesn't exist, return an empty array as JSON string
        return '[]';
      }
      throw err;
    }
  }

  // Write method: Writes updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, '\t'));
    } catch (err) {
      console.error('Error writing cities:', err);
      throw err;
    }
  }

  // GetCities method: Reads and parses the cities from the JSON file
  async getCities(): Promise<City[]> {
    try {
      const data = await this.read();
      return JSON.parse(data) as City[];
    } catch (err) {
      console.error('Error reading cities:', err);
      return [];
    }
  }

  // AddCity method: Adds a city to the searchHistory.json file
  async addCity(city: City): Promise<void> {
    try {
      const cities = await this.getCities();
      cities.push(city);
      await this.write(cities);
    } catch (err) {
      console.error('Error adding city:', err);
    }
  }

  // RemoveCity method: Removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    try {
      const cities = await this.getCities();
      const updatedCities = cities.filter((city) => city.id !== id);
      await this.write(updatedCities);
    } catch (err) {
      console.error('Error removing city:', err);
    }
  }
}

export default new HistoryService();
