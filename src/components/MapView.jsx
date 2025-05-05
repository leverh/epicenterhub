import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import styles from '../styles/MapView.module.css';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});


const getCircleSize = (magnitude) => {
  const baseMag = Math.max(0, magnitude || 0);
  return Math.max(4, baseMag * 3); 
};


const getCircleColor = (depth) => {
  if (depth < 10) return '#f56565'; // Shallow - red
  if (depth < 70) return '#ed8936'; // Shallow - orange
  if (depth < 300) return '#ecc94b'; // Intermediate - yellow
  return '#48bb78'; // Deep - green
};


const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const MapView = ({ earthquakes }) => {
  const center = [20, 0]; // Center of the world map
  
  return (
    <div className={styles.mapContainer}>
      <h2>Earthquake Map</h2>
      <MapContainer 
        center={center} 
        zoom={2} 
        scrollWheelZoom={true} 
        style={{ height: '60vh', width: '100%' }}
        className={styles.map}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        
        {earthquakes.map((quake) => {
          const [lon, lat, depth] = quake.geometry.coordinates;
          const magnitude = quake.properties.mag || 0;
          
          return (
            <CircleMarker 
              key={quake.id} 
              center={[lat, lon]}
              radius={getCircleSize(magnitude)}
              pathOptions={{
                color: getCircleColor(depth),
                fillColor: getCircleColor(depth),
                fillOpacity: 0.8,
                weight: 1
              }}
            >
              <Popup className={styles.popup}>
                <div className={styles.popupContent}>
                  <h3>{quake.properties.place || 'Unknown Location'}</h3>
                  <table className={styles.popupTable}>
                    <tbody>
                      <tr>
                        <td>Magnitude:</td>
                        <td><strong>{magnitude.toFixed(1)}</strong></td>
                      </tr>
                      <tr>
                        <td>Depth:</td>
                        <td><strong>{depth.toFixed(1)} km</strong></td>
                      </tr>
                      <tr>
                        <td>Time:</td>
                        <td>{formatDate(quake.properties.time)}</td>
                      </tr>
                      {quake.properties.felt && (
                        <tr>
                          <td>Felt by:</td>
                          <td>{quake.properties.felt} people</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {quake.properties.url && (
                    <a 
                      href={quake.properties.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.popupLink}
                    >
                      View Details
                    </a>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      <div className={styles.legendContainer}>
        <h4>Legend</h4>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#f56565' }}></span>
          <span>Very Shallow (&lt; 10km)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#ed8936' }}></span>
          <span>Shallow (10-70km)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#ecc94b' }}></span>
          <span>Intermediate (70-300km)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#48bb78' }}></span>
          <span>Deep (&gt; 300km)</span>
        </div>
        <div className={styles.legendNote}>
          <span>* Circle size corresponds to magnitude</span>
        </div>
      </div>
    </div>
  );
};

MapView.propTypes = {
  earthquakes: PropTypes.array.isRequired,
};

export default MapView;