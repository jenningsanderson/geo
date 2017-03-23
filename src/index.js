import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/GeoJSONVisualizer.jsx'
import MapControl from './components/MapControl.jsx'

require("style-loader!css-loader!./css/main.css")

ReactDOM.render(<App />, document.getElementById('left-container-react'));
ReactDOM.render(<MapControl />, document.getElementById('map-control-box'));
