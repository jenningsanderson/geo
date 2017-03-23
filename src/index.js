import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/GeoJSONVisualizer.jsx'

require("style-loader!css-loader!./css/main.css")

var getURLParam = function(name) {
  var url = window.location.href;
  var name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

ReactDOM.render(<App getURLParam={getURLParam}/>, document.getElementById('left-container-react'));
