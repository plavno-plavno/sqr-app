import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@ant-design/v5-patch-for-react-19';
import './styles/global.scss';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
