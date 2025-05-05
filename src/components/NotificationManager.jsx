// import { useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';

// const NotificationManager = ({ earthquakes, threshold = 5 }) => {
//   const notifiedIds = useRef(new Set());

//   useEffect(() => {
//     if (!('Notification' in window)) return;

//     Notification.requestPermission();

//     earthquakes.forEach((q) => {
//       const id = q.id;
//       const mag = q.properties.mag;

//       if (mag >= threshold && !notifiedIds.current.has(id)) {
//         notifiedIds.current.add(id);

//         new Notification('⚠️ Significant Earthquake', {
//           body: `${q.properties.place}\nMagnitude: ${mag}`,
//         });
//       }
//     });
//   }, [earthquakes, threshold]);

//   return null;
// };

// NotificationManager.propTypes = {
//   earthquakes: PropTypes.array.isRequired,
//   threshold: PropTypes.number,
// };

// export default NotificationManager;
