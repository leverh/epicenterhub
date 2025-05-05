const USGS_BASE_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';

export const fetchEarthquakeData = async (feedType = 'all_day') => {
  const url = `${USGS_BASE_URL}/${feedType}.geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch earthquake data:', err);
    return null;
  }
};
