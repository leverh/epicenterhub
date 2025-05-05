import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import styles from '../../styles/AdvancedCharts.module.css';

const MagnitudeHistogram = ({ earthquakes }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  
  const statistics = useMemo(() => {
    const magnitudes = earthquakes
      .map((q) => q.properties.mag)
      .filter((mag) => typeof mag === 'number');
    
    if (magnitudes.length === 0) return null;
    
    return {
      count: magnitudes.length,
      min: d3.min(magnitudes).toFixed(1),
      max: d3.max(magnitudes).toFixed(1),
      mean: d3.mean(magnitudes).toFixed(1),
      median: d3.median(magnitudes).toFixed(1)
    };
  }, [earthquakes]);
  
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    
    const containerWidth = containerRef.current.clientWidth;
    
    
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    
    const svg = d3
      .select(svgRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    
    const magnitudes = earthquakes
      .map((q) => q.properties.mag)
      .filter((mag) => typeof mag === 'number');
    
    if (magnitudes.length === 0) {
      
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#a0aec0')
        .text('No magnitude data available');
      return;
    }
    
    
    const x = d3
      .scaleLinear()
      .domain([0, Math.ceil(d3.max(magnitudes))])
      .nice()
      .range([0, width]);
    
    
    const histogram = d3
      .histogram()
      .domain(x.domain())
      .thresholds(x.ticks(10));
    
    const bins = histogram(magnitudes);
    
    
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([height, 0]);
    
    
    const tooltip = d3.select(tooltipRef.current);
    
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickFormat(d => d.toFixed(1))
          .tickSize(-5)
      )
      .call(g => g.select(".domain").attr("stroke", "#cbd5e0"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e0"))
      .call(g => g.selectAll(".tick text").attr("fill", "#718096").style("font-size", "12px"));
    
    
    svg.append('g')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-5)
      )
      .call(g => g.select(".domain").attr("stroke", "#cbd5e0"))
      .call(g => g.selectAll(".tick line").attr("stroke", "#cbd5e0"))
      .call(g => g.selectAll(".tick text").attr("fill", "#718096").style("font-size", "12px"));
    
    
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .style('fill', '#4a5568')
      .style('font-size', '14px')
      .text('Magnitude');
    
    
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 15)
      .style('fill', '#4a5568')
      .style('font-size', '14px')
      .text('Number of Earthquakes');
    
    
    svg.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3,3');
    
    
    svg.selectAll('rect')
      .data(bins)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x0) + 1)
      .attr('y', d => y(d.length))
      .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr('height', d => height - y(d.length))
      .attr('fill', '#4299e1')
      .attr('rx', 3)
      .attr('ry', 3)
      .on('mouseover', function(event, d) {
        
        d3.select(this).attr('fill', '#3182ce');
        
        
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 25}px`)
          .html(`
            <div>
              <strong>Magnitude: ${d.x0.toFixed(1)} to ${d.x1.toFixed(1)}</strong><br>
              <span>Earthquakes: ${d.length}</span>
            </div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 25}px`);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#4299e1');
        tooltip.style('opacity', 0);
      });
    
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#2d3748')
      .text('Earthquake Magnitude Distribution');
      
    
    if (statistics) {
      const meanValue = parseFloat(statistics.mean);
      svg.append('line')
        .attr('x1', x(meanValue))
        .attr('x2', x(meanValue))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#e53e3e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
      
      
      svg.append('rect')
        .attr('x', x(meanValue) - 35)
        .attr('y', 5)
        .attr('width', 70)
        .attr('height', 20)
        .attr('fill', 'white')
        .attr('stroke', '#e53e3e')
        .attr('stroke-width', 1)
        .attr('rx', 3);
        
      svg.append('text')
        .attr('x', x(meanValue))
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e53e3e')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`Mean: ${statistics.mean}`);
    }
      
    
    svg.selectAll('.bar')
      .attr('y', height)
      .attr('height', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('y', d => y(d.length))
      .attr('height', d => height - y(d.length));
      
  }, [earthquakes, windowWidth, statistics]);

  return (
    <div className={styles.advancedChart}>
      <div className={styles.chartHeader}>
        <h3>Magnitude Distribution</h3>
        <div className={styles.chartDescription}>
          Histogram showing the frequency of earthquakes by magnitude
        </div>
      </div>
      
      <div className={styles.chartContainer} ref={containerRef}>
        <div className={styles.d3Container} ref={svgRef}></div>
        <div 
          ref={tooltipRef} 
          className={styles.tooltip}
          style={{ opacity: 0, position: 'absolute' }}
        ></div>
      </div>
      
      {statistics && (
        <div className={styles.chartFooter}>
          <div className={styles.chartMetric}>
            <span className={styles.metricLabel}>Minimum</span>
            <span className={styles.metricValue}>{statistics.min}</span>
          </div>
          <div className={styles.chartMetric}>
            <span className={styles.metricLabel}>Maximum</span>
            <span className={styles.metricValue}>{statistics.max}</span>
          </div>
          <div className={styles.chartMetric}>
            <span className={styles.metricLabel}>Average</span>
            <span className={styles.metricValue}>{statistics.mean}</span>
          </div>
          <div className={styles.chartMetric}>
            <span className={styles.metricLabel}>Median</span>
            <span className={styles.metricValue}>{statistics.median}</span>
          </div>
        </div>
      )}
    </div>
  );
};

MagnitudeHistogram.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

export default MagnitudeHistogram;