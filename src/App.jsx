import { useState, useEffect } from 'react';
import { useEarthquakeData } from './hooks/useEarthquakeData';
import { useInterval } from './hooks/useInterval';
import MapView from './components/MapView';
import ChartPanel from './components/ChartPanel';
import FilterControls from './components/FilterControls';
import styles from './App.module.css';

import { 
  AreaChart,
  DepthPieChart, 
  MagnitudeHistogram, 
  HeatmapChart 
} from './components/AdvancedCharts';

function App() {
  const [refresh, setRefresh] = useState(0);
  const [filters, setFilters] = useState({
    magnitude: [0, 10],
    depthCategories: ['shallow', 'intermediate', 'deep'],
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeChart, setActiveChart] = useState('all');

  // Auto refresh every minute
  useInterval(() => {
    setRefresh((r) => r + 1);
    setLastUpdate(new Date());
  }, 60000);

  const { earthquakes, loading, error } = useEarthquakeData('all_day', refresh);

  const filterQuakes = (quakes) =>
    quakes?.filter((q) => {
      const mag = q.properties.mag ?? 0;
      const depth = q.geometry.coordinates[2];
      const inMagRange = mag >= filters.magnitude[0] && mag <= filters.magnitude[1];
      const depthCategory =
        depth < 70 ? 'shallow' : depth <= 300 ? 'intermediate' : 'deep';
      const inDepth = filters.depthCategories.includes(depthCategory);
      return inMagRange && inDepth;
    }) || [];

  const filteredQuakes = earthquakes ? filterQuakes(earthquakes) : [];
  const quakeCount = filteredQuakes.length;

  // Get statistics for summary cards
  const getStatistics = () => {
    if (!filteredQuakes.length) return { avgMag: 0, maxMag: 0 };
    
    const magnitudes = filteredQuakes.map(q => q.properties.mag).filter(mag => typeof mag === 'number');
    
    return {
      avgMag: (magnitudes.reduce((sum, m) => sum + m, 0) / magnitudes.length).toFixed(1),
      maxMag: Math.max(...magnitudes).toFixed(1)
    };
  };

  const { avgMag, maxMag } = getStatistics();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>EpicenterHub</h1>
        <p className={styles.subtitle}>
          Visualizing recent seismic activity around the world
        </p>
        {!loading && !error && (
          <div className={styles.statusBar}>
            <span>Showing {quakeCount} earthquakes</span>
            <span>•</span>
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </header>

      {loading && (
        <div className={styles.loading}>
          <p>Loading earthquake data...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button 
            onClick={() => setRefresh(r => r + 1)}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Main layout with sidebar and content */}
          <div className={styles.appGrid}>
            <aside>
              <div className={styles.filtersPanel}>
                <FilterControls filters={filters} setFilters={setFilters} />
              </div>
            </aside>
            
            <main>
              {/* Map section */}
              <section className={styles.mapPanel}>
                <MapView earthquakes={filteredQuakes} />
              </section>
              
              {/* Basic analytics section */}
              <section className={styles.dashboardSection}>
                <div className={styles.sectionHeader}>
                  {/* <h2 className={styles.dashboardTitle}>Earthquake Analytics</h2> */}
                </div>
                
                <div className={styles.analyticsGrid}>
                  <ChartPanel earthquakes={filteredQuakes} />
                </div>
                
                {/* Summary statistics cards */}
                {/* <div className={styles.statsRow}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Earthquakes</div>
                    <div className={styles.statValue}>{quakeCount}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Avg. Magnitude</div>
                    <div className={styles.statValue}>{avgMag}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Strongest</div>
                    <div className={styles.statValue}>{maxMag}</div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Last 24 Hours</div>
                    <div className={styles.statValue}>
                      <div className={`${styles.statBadge} ${styles.live}`}>Live</div>
                    </div>
                  </div>
                </div> */}
              </section>
            </main>
          </div>

          {/* Advanced Analytics Section */}
          <section className={styles.advancedSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.dashboardTitle}>Advanced Analytics</h2>
              <div className={styles.controls}>
                {showAdvanced && (
                  <div className={styles.chartTabs}>
                    <button 
                      className={`${styles.chartTab} ${activeChart === 'all' ? styles.activeTab : ''}`}
                      onClick={() => setActiveChart('all')}
                    >
                      All Charts
                    </button>
                    <button 
                      className={`${styles.chartTab} ${activeChart === 'area' ? styles.activeTab : ''}`}
                      onClick={() => setActiveChart('area')}
                    >
                      Temporal
                    </button>
                    <button 
                      className={`${styles.chartTab} ${activeChart === 'depth' ? styles.activeTab : ''}`}
                      onClick={() => setActiveChart('depth')}
                    >
                      Depth
                    </button>
                    <button 
                      className={`${styles.chartTab} ${activeChart === 'heatmap' ? styles.activeTab : ''}`}
                      onClick={() => setActiveChart('heatmap')}
                    >
                      Patterns
                    </button>
                    <button 
                      className={`${styles.chartTab} ${activeChart === 'histogram' ? styles.activeTab : ''}`}
                      onClick={() => setActiveChart('histogram')}
                    >
                      Histogram
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={styles.toggleButton}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Charts
                </button>
              </div>
            </div>

            {showAdvanced && (
              <div className={activeChart === 'all' ? styles.advancedChartsGrid : styles.singleChartContainer}>
                {(activeChart === 'all' || activeChart === 'area') && (
                  <AreaChart earthquakes={filteredQuakes} />
                )}
                {(activeChart === 'all' || activeChart === 'depth') && (
                  <DepthPieChart earthquakes={filteredQuakes} />
                )}
                {(activeChart === 'all' || activeChart === 'heatmap') && (
                  <HeatmapChart earthquakes={filteredQuakes} />
                )}
                {(activeChart === 'all' || activeChart === 'histogram') && (
                  <MagnitudeHistogram earthquakes={filteredQuakes} />
                )}
              </div>
            )}
          </section>

          <footer className={styles.footer}>
  <p>Data sourced from USGS Earthquake API • Refreshes automatically every minute</p>
  <p>
    <button
      onClick={() => {
        setRefresh(r => r + 1);
        setLastUpdate(new Date());
      }}
      className={styles.refreshButton}
    >
      Refresh Now
    </button>
  </p>
  <div className={styles.footerBottom}>
    <p>© {new Date().getFullYear()} - All rights reserved</p>
    <p>
      Created by <a href="https://pixelsummit.dev/" target="_blank" rel="noopener noreferrer" className={styles.portfolioLink}>PixelSummit</a>
    </p>
  </div>
</footer>
        </>
      )}
    </div>
  );
}

export default App;