import React from 'react';
import ReactApexChart from 'react-apexcharts';
import PropTypes from 'prop-types';
import styles from '../../styles/ChartPanel.module.css';

const groupByHour = (earthquakes) => {
  const hourCounts = {};

  earthquakes.forEach((q) => {
    const date = new Date(q.properties.time);
    const hour = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours()
    ).toISOString();

    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([x, y]) => ({ x, y }));
};

const AreaChart = ({ earthquakes }) => {
  const data = groupByHour(earthquakes);

  const options = {
    chart: {
      type: 'area',
      zoom: { enabled: false },
    },
    title: {
      text: 'Quakes Over Time (Hourly)',
    },
    xaxis: {
      type: 'datetime',
    },
    stroke: {
      curve: 'smooth',
    },
  };

  const series = [
    {
      name: 'Quakes',
      data,
    },
  ];

  return (
    <div className={styles.chart}>
      <ReactApexChart options={options} series={series} type="area" height={300} />
    </div>
  );
};

AreaChart.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

export default AreaChart;
