import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/FilterControls.module.css';

const FilterControls = ({ filters, setFilters }) => {
  const [expandedSection, setExpandedSection] = useState('magnitude');
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleMagnitudeChange = (e) => {
    const value = Number(e.target.value);
    setFilters((prev) => ({ ...prev, magnitude: [0, value] }));
  };

  const handleDepthChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      depthCategories: checked
        ? [...prev.depthCategories, value]
        : prev.depthCategories.filter((d) => d !== value),
    }));
  };

  const resetFilters = () => {
    setFilters({
      magnitude: [0, 10],
      depthCategories: ['shallow', 'intermediate', 'deep'],
    });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.header}>
        <h2>Filter Earthquakes</h2>
        <button 
          className={styles.resetButton} 
          onClick={resetFilters}
          title="Reset all filters"
        >
          Reset
        </button>
      </div>

      <div className={styles.filterSection}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('magnitude')}
        >
          <h3>Magnitude</h3>
          <span className={styles.expandIcon}>
            {expandedSection === 'magnitude' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'magnitude' && (
          <div className={styles.sectionContent}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.magnitude[1]}
                onChange={handleMagnitudeChange}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
            <div className={styles.magnitudeDisplay}>
              <span>Showing magnitudes:</span>
              <strong>{filters.magnitude[0]}–{filters.magnitude[1]}</strong>
            </div>
            <div className={styles.magnitudeInfo}>
              <div className={styles.magnitudeScale}>
                <div className={styles.magnitudeBar} style={{ width: '10%' }}></div>
                <span>Minor</span>
              </div>
              <div className={styles.magnitudeScale}>
                <div className={styles.magnitudeBar} style={{ width: '30%' }}></div>
                <span>Moderate</span>
              </div>
              <div className={styles.magnitudeScale}>
                <div className={styles.magnitudeBar} style={{ width: '60%' }}></div>
                <span>Strong</span>
              </div>
              <div className={styles.magnitudeScale}>
                <div className={styles.magnitudeBar} style={{ width: '90%' }}></div>
                <span>Major</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.filterSection}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection('depth')}
        >
          <h3>Depth</h3>
          <span className={styles.expandIcon}>
            {expandedSection === 'depth' ? '−' : '+'}
          </span>
        </div>
        
        {expandedSection === 'depth' && (
          <div className={styles.sectionContent}>
            <div className={styles.checkboxContainer}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  value="shallow"
                  checked={filters.depthCategories.includes('shallow')}
                  onChange={handleDepthChange}
                />
                <div className={styles.checkboxLabel}>
                  <span className={styles.depthIndicator} style={{ backgroundColor: '#ed8936' }}></span>
                  <div>
                    <strong>Shallow</strong>
                    <span className={styles.depthRange}>&lt; 70km</span>
                  </div>
                </div>
              </label>
              
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  value="intermediate"
                  checked={filters.depthCategories.includes('intermediate')}
                  onChange={handleDepthChange}
                />
                <div className={styles.checkboxLabel}>
                  <span className={styles.depthIndicator} style={{ backgroundColor: '#ecc94b' }}></span>
                  <div>
                    <strong>Intermediate</strong>
                    <span className={styles.depthRange}>70–300km</span>
                  </div>
                </div>
              </label>
              
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  value="deep"
                  checked={filters.depthCategories.includes('deep')}
                  onChange={handleDepthChange}
                />
                <div className={styles.checkboxLabel}>
                  <span className={styles.depthIndicator} style={{ backgroundColor: '#48bb78' }}></span>
                  <div>
                    <strong>Deep</strong>
                    <span className={styles.depthRange}>&gt; 300km</span>
                  </div>
                </div>
              </label>
            </div>
            
            <div className={styles.depthInfo}>
              <p>Earthquake depth indicates distance below the Earth's surface. Shallow earthquakes are often more damaging despite sometimes having lower magnitudes.</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.filterInfo}>
        <p>Data refreshes automatically every minute. Filter settings will be preserved.</p>
      </div>
    </div>
  );
};

FilterControls.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default FilterControls;