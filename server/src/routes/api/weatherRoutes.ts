import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// POST Request to retrieve weather data by city name and save to search history
router.post('/', async (req: Request, res: Response) => {
  

  try {
    // Fetch weather data
    const cityName = req.body.cityName;

    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Save city to search history
    const city = { name: cityName, id: `${Date.now()}` }; // Generate a unique ID
    await HistoryService.addCity(city);

    res.status(200).json({
      message: 'Weather data fetched successfully.',
      weather: weatherData,
      history: city,
    });
  } catch (err) {
    console.error('Error fetching weather data:', err);
    res.status(500).json({
      message: 'Failed to fetch weather data.',
      error: (err as Error).message,
    });
  }
});

// GET Request to retrieve the search history
router.get('/searchHistory', async (_req: Request, res: Response) => {
  
  try {
    const history = await HistoryService.getCities();
    res.status(200).json({
      message: 'Search history retrieved successfully.',
      history,
    });
  } catch (err) {
    console.error('Error retrieving search history:', err);
    res.status(500).json({
      message: 'Failed to retrieve search history.',
      error: (err as Error).message,
    });
  }
});

// DELETE Request to remove a city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  const cityId = req.params.id;

  try {
    await HistoryService.removeCity(cityId);
    res.status(200).json({
      message: `City with ID ${cityId} removed successfully.`,
    });
  } catch (err) {
    console.error('Error removing city:', err);
    res.status(500).json({
      message: 'Failed to remove city from search history.',
      error: (err as Error).message,
    });
  }
});

export default router;
