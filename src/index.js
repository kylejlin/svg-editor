import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SVGEditor from './SVGEditor';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<SVGEditor />, document.getElementById('root'));
registerServiceWorker();
