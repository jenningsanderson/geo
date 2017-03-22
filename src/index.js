import React from 'react';
import ReactDOM from 'react-dom';

import JSONTextBox from './components/JSONTextBox.jsx'

require("style-loader!css-loader!./css/main.css")

ReactDOM.render(<JSONTextBox />, document.getElementById('left-container'));
