import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

ReactDOM.createRoot = function () {
    return undefined;
};
const root = ReactDOM.createRoot();
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
