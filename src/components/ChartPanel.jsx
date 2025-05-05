import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from 'recharts';
import PropTypes from 'prop-types';
import styles from '../styles/ChartPanel.module.css';

const formatLineChartData = (quakes) => {
  const hourlyCounts = {};
  quakes.forEach((q) => {
    const date = new Date(q.properties.time);
    const hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
    if (!hourlyCounts[hour]) hourlyCounts[hour] = 0;
    hourlyCounts[hour]++;
  });
  

  const sortedData = Object.entries(hourlyCounts)
    .map(([time, count]) => ({ 
      time, 
      count,
      formattedTime: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));
  
  return sortedData;
};

const formatBarChartData = (quakes) => {
  const ranges = [0, 1, 2, 3, 4, 5, 6];
  const counts = {};
  ranges.forEach((r) => (counts[r] = 0));
  
  quakes.forEach((q) => {
    const mag = Math.floor(q.properties.mag || 0);
    const bucket = Math.min(mag, 6); // Cap at 6+
    counts[bucket]++;
  });
  
  return Object.entries(counts).map(([range, count]) => ({
    range: range === '6' ? '6+' : `${range}–${+range + 1}`,
    count,
    fill: getMagnitudeColor(Number(range))
  }));
};

const formatDepthData = (quakes) => {
  const depthCategories = {
    'Shallow (0-70km)': 0,
    'Intermediate (70-300km)': 0,
    'Deep (>300km)': 0
  };
  
  quakes.forEach(quake => {
    const depth = quake.geometry.coordinates[2];
    if (depth < 70) {
      depthCategories['Shallow (0-70km)']++;
    } else if (depth <= 300) {
      depthCategories['Intermediate (70-300km)']++;
    } else {
      depthCategories['Deep (>300km)']++;
    }
  });
  
  const COLORS = ['#ed8936', '#ecc94b', '#48bb78'];
  
  return Object.entries(depthCategories).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index]
  }));
};

const getMagnitudeColor = (magnitude) => {
  const colors = [
    '#9ae6b4', // 0-1: Light green
    '#68d391', // 1-2: Medium green
    '#4299e1', // 2-3: Blue
    '#3182ce', // 3-4: Darker blue
    '#ed8936', // 4-5: Orange
    '#dd6b20', // 5-6: Dark orange
    '#e53e3e'  // 6+: Red
  ];
  return colors[Math.min(magnitude, 6)];
};

const TimeTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{new Date(label).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit'
        })}</p>
        <p className={styles.tooltipValue}>
          <span>Earthquakes: </span>
          <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const MagnitudeTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const [min, max] = label.split('–');
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>Magnitude {label}</p>
        <p className={styles.tooltipValue}>
          <span>Earthquakes: </span>
          <strong>{payload[0].value}</strong>
        </p>
        <p className={styles.tooltipDescription}>
          {getDescriptionForMagnitude(Number(min))}
        </p>
      </div>
    );
  }
  return null;
};

const getDescriptionForMagnitude = (magnitude) => {
  if (magnitude < 2) return 'Not felt or minor shaking';
  if (magnitude < 4) return 'Felt by many, minor damage';
  if (magnitude < 6) return 'Moderate to strong, some damage';
  return 'Strong to severe damage possible';
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#2d3748" className={styles.pieChartCenter}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#4a5568" className={styles.pieChartValue}>
        {value} quakes ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius}
        fill={fill}
      />
    </g>
  );
};

// Main component
const ChartPanel = ({ earthquakes }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const lineData = formatLineChartData(earthquakes);
  const barData = formatBarChartData(earthquakes);
  const depthData = formatDepthData(earthquakes);
  
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className={styles.panel}>
      <h2>Earthquake Analytics</h2>
      
      <div className={styles.chartGrid}>
        <div className={styles.chart}>
          <h3>Earthquakes Over Time</h3>
          <div className={styles.chartDescription}>
            Shows the number of earthquakes detected each hour
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).getHours() + 'h'} 
                stroke="#718096"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#718096" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<TimeTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#4299e1" 
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.chart}>
          <h3>Earthquakes by Magnitude</h3>
          <div className={styles.chartDescription}>
            Frequency distribution by magnitude range
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="range" 
                stroke="#718096"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#718096" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<MagnitudeTooltip />} />
              <Bar 
                dataKey="count" 
                barSize={36}
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className={styles.chart}>
        <h3>Depth Distribution</h3>
        <div className={styles.chartDescription}>
          Breakdown of earthquakes by depth category
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={depthData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {depthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className={styles.chartInfo}>
        <div className={styles.infoItem}>
          <h4>Total Earthquakes</h4>
          <div className={styles.infoValue}>{earthquakes.length}</div>
        </div>
        <div className={styles.infoItem}>
          <h4>Avg. Magnitude</h4>
          <div className={styles.infoValue}>
            {(earthquakes.reduce((sum, quake) => sum + (quake.properties.mag || 0), 0) / 
              (earthquakes.length || 1)).toFixed(1)}
          </div>
        </div>
        <div className={styles.infoItem}>
          <h4>Strongest</h4>
          <div className={styles.infoValue}>
            {Math.max(...earthquakes.map(quake => quake.properties.mag || 0)).toFixed(1)}
          </div>
        </div>
        <div className={styles.infoItem}>
          <h4>Last 24 Hours</h4>
          <div className={styles.infoValue}>
            <span className={styles.refreshIndicator}></span> Live
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes
ChartPanel.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

TimeTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

MagnitudeTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

export default ChartPanel;