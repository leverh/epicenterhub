import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';
import styles from '../../styles/AdvancedCharts.module.css';

const HeatmapChart = ({ earthquakes }) => {

  const { series, insights } = useMemo(() => {
    
    const buckets = {};
    const magnitudeCounts = {}; 
    const hourCounts = {}; 
    
    earthquakes.forEach((q) => {
      const mag = Math.floor(q.properties.mag || 0);
      const hour = new Date(q.properties.time).getUTCHours();
      
      
      const capMag = Math.min(mag, 7);
      
      const key = `${capMag}-${hour}`;
      buckets[key] = (buckets[key] || 0) + 1;
      
      
      magnitudeCounts[capMag] = (magnitudeCounts[capMag] || 0) + 1;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    
    const magnitudeBuckets = Array.from({ length: 8 }, (_, i) => i);
    
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    
    let peakHour = 0;
    let peakCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > peakCount) {
        peakHour = Number(hour);
        peakCount = count;
      }
    });
    
    
    let commonMag = 0;
    let commonCount = 0;
    Object.entries(magnitudeCounts).forEach(([mag, count]) => {
      if (count > commonCount) {
        commonMag = Number(mag);
        commonCount = count;
      }
    });
    
    
    const chartSeries = magnitudeBuckets.map((mag) => ({
      name: mag === 7 ? 'Mag 7+' : `Mag ${mag}`,
      data: hours.map((h) => ({
        x: `${h}:00`,
        y: buckets[`${mag}-${h}`] || 0,
      })),
    }));
    
    
    const maxValue = Math.max(
      ...Object.values(buckets).filter(value => Number.isFinite(value)),
      1
    );
    
    
    const insightsData = {
      peakHour: `${peakHour}:00 UTC`,
      peakCount,
      commonMag: commonMag === 7 ? '7+' : commonMag.toString(),
      commonCount,
      maxIntensity: maxValue
    };
    
    return { series: chartSeries, insights: insightsData };
  }, [earthquakes]);
  
  
  const options = {
    chart: {
      type: 'heatmap',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      background: 'transparent',
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: "#e2e8f0",
              name: 'None',
            },
          ],
          inverse: false,
          min: 0,
          max: undefined
        },
      }
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#4299e1"],
    title: {
      text: 'Earthquake Frequency by Hour & Magnitude',
      align: 'left',
      style: {
        fontSize: '18px',
        fontWeight: 600,
        color: '#2d3748'
      }
    },
    subtitle: {
      text: 'Distribution across 24-hour cycle (UTC time)',
      align: 'left',
      style: {
        fontSize: '13px',
        color: '#718096'
      }
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const magnitude = w.config.series[seriesIndex].name;
        const hour = w.config.series[seriesIndex].data[dataPointIndex].x;
        const count = series[seriesIndex][dataPointIndex];
        
        return `
          <div class="${styles.customTooltip}" style="padding: 10px;">
            <div style="font-weight: 600; margin-bottom: 5px; color: #2d3748;">${magnitude} at ${hour} UTC</div>
            <div style="font-size: 14px; color: #4a5568;">${count} earthquake${count !== 1 ? 's' : ''}</div>
          </div>
        `;
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      title: {
        text: 'Hour (UTC)',
        style: {
          fontSize: '13px',
          color: '#718096',
          fontWeight: 500
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#718096'
        },
        formatter: function(val) {
          return val;
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      title: {
        text: 'Magnitude',
        style: {
          fontSize: '13px',
          color: '#718096',
          fontWeight: 500
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#718096'
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
      }
    },
    theme: {
      mode: 'light',
      palette: 'palette1'
    }
  };

  return (
    <div className={styles.advancedChart}>
      <div className={styles.chartHeader}>
        <h3>Temporal & Magnitude Patterns</h3>
        <div className={styles.chartDescription}>
          Visualizes frequency patterns across magnitude levels and hours of the day
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        {series && series.length > 0 ? (
          <ReactApexChart 
            options={options} 
            series={series} 
            type="heatmap" 
            height={400} 
            className={styles.apexChart}
          />
        ) : (
          <div className={styles.noDataMessage}>No data available for the selected filters</div>
        )}
      </div>
      
      {insights && (
        <div className={styles.insightBlocks}>
          <div className={styles.insightBlock}>
            <div className={styles.insightTitle}>Peak Activity Hour</div>
            <div className={styles.insightValue}>{insights.peakHour}</div>
            <div className={styles.insightDesc}>
              {insights.peakCount} earthquakes recorded during this hour
            </div>
          </div>
          
          <div className={styles.insightBlock}>
            <div className={styles.insightTitle}>Most Common Magnitude</div>
            <div className={styles.insightValue}>Magnitude {insights.commonMag}</div>
            <div className={styles.insightDesc}>
              {insights.commonCount} earthquakes of this magnitude recorded
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

HeatmapChart.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

export default HeatmapChart;