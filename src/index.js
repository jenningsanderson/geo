import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/GeoJSONVisualizer.jsx'

require("style-loader!css-loader!./css/main.css")

ReactDOM.render(<App />, document.getElementById('left-container-react'));
