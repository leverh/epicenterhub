import { useRef, useState, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import styles from '../../styles/AdvancedCharts.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const categorizeDepth = (depth) => {
  if (depth < 70) return 'Shallow (<70km)';
  if (depth <= 300) return 'Intermediate (70-300km)';
  return 'Deep (>300km)';
};

const DepthPieChart = ({ earthquakes }) => {
  const [totalQuakes, setTotalQuakes] = useState(0);
  const chartRef = useRef(null);
  
  const processedData = useMemo(() => {
    const counts = {
      'Shallow (<70km)': 0,
      'Intermediate (70-300km)': 0,
      'Deep (>300km)': 0,
    };
    
    earthquakes.forEach((q) => {
      const depth = q.geometry.coordinates[2];
      const category = categorizeDepth(depth);
      counts[category]++;
    });
    
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    setTotalQuakes(total);
    
    const pct = {};
    let maxCat = { name: '', count: 0 };
    
    Object.entries(counts).forEach(([category, count]) => {
      pct[category] = total > 0 ? Math.round((count / total) * 100) : 0;
      if (count > maxCat.count) {
        maxCat = { name: category, count };
      }
    });
    
    return { 
      depthCounts: counts, 
      percentages: pct,
      maxCategory: maxCat
    };
  }, [earthquakes]);
  
  const { depthCounts, percentages, maxCategory } = processedData;

  // Chart data
  const data = {
    labels: Object.keys(depthCounts || {}),
    datasets: [
      {
        label: 'Earthquakes by Depth',
        data: Object.values(depthCounts || {}),
        backgroundColor: [
          '#ed8936', // Shallow
          '#ecc94b', // Intermediate
          '#48bb78', // Deep
        ],
        borderColor: [
          '#dd6b20',
          '#d69e2e',
          '#38a169',
        ],
        borderWidth: 1,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%', 
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const percentage = (value / totalQuakes * 100).toFixed(1);
            return `${context.label}: ${value} earthquakes (${percentage}%)`;
          }
        },
        padding: 12,
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        titleFont: {
          size: 14,
          family: "'Inter', sans-serif",
          weight: 'bold',
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    },
  };

  
  const customStyles = {
    chartLayout: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      height: '400px', 
    },
    chartRow: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      position: 'relative',
      height: '80%',
    },
    pieContainer: {
      width: '65%',
      position: 'relative',
    },
    pieWrapper: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    legendWrapper: {
      width: '35%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: '15px',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      margin: '8px 0',
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      marginRight: '8px',
    },
    legendLabel: {
      fontSize: '13px',
      color: '#718096',
    },
    centerWrapper: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '50%',
      padding: '15px',
      width: '110px',
      height: '110px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    centerTitle: {
      fontSize: '14px',
      color: '#718096',
      marginBottom: '5px',
    },
    centerValue: {
      fontSize: '24px',
      color: '#2d3748',
      fontWeight: 'bold',
    }
  };

  return (
    <div className={styles.advancedChart}>
      <div className={styles.chartHeader}>
        <h3>Depth Distribution</h3>
        <div className={styles.chartDescription}>
          Breakdown of earthquakes by depth category
        </div>
      </div>
      
      <div style={customStyles.chartLayout}>
        <div style={customStyles.chartRow}>
          <div style={customStyles.pieContainer}>
            <div style={customStyles.pieWrapper}>
              <Pie data={data} options={options} ref={chartRef} />
              
              <div style={customStyles.centerWrapper}>
                <div style={customStyles.centerTitle}>Total</div>
                <div style={customStyles.centerValue}>{totalQuakes}</div>
              </div>
            </div>
          </div>
          
          <div style={customStyles.legendWrapper}>
            <div style={customStyles.legendItem}>
              <div 
                style={{
                  ...customStyles.legendColor,
                  backgroundColor: '#ed8936'
                }}
              ></div>
              <div style={customStyles.legendLabel}>Shallow (&lt;70km)</div>
            </div>
            <div style={customStyles.legendItem}>
              <div 
                style={{
                  ...customStyles.legendColor,
                  backgroundColor: '#ecc94b'
                }}
              ></div>
              <div style={customStyles.legendLabel}>Intermediate (70-300km)</div>
            </div>
            <div style={customStyles.legendItem}>
              <div 
                style={{
                  ...customStyles.legendColor,
                  backgroundColor: '#48bb78'
                }}
              ></div>
              <div style={customStyles.legendLabel}>Deep (&gt;300km)</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.chartFooter}>
        <div className={styles.chartMetric}>
          <span className={styles.metricLabel}>Most Common</span>
          <span className={styles.metricValue}>
            {maxCategory ? maxCategory.name : 'N/A'}
          </span>
        </div>
        <div className={styles.chartMetric}>
          <span className={styles.metricLabel}>Shallow %</span>
          <span className={styles.metricValue}>
            {percentages && percentages['Shallow (<70km)'] 
              ? `${percentages['Shallow (<70km)']}%`
              : '0%'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

DepthPieChart.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

export default DepthPieChart;