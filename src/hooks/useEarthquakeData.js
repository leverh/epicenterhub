import { useEffect, useState } from 'react';
import { fetchEarthquakeData } from '../services/usgsApi';

export const useEarthquakeData = (feedType = 'all_day', refreshSignal = 0) => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchEarthquakeData(feedType);

      if (data && data.features) {
        setEarthquakes(data.features);
        setError(null);
      } else {
        setError('Could not load earthquake data');
      }

      setLoading(false);
    };

    loadData();
  }, [feedType, refreshSignal]);

  return { earthquakes, loading, error };
};
