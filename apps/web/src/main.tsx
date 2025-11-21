import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'
import { Theme } from '@radix-ui/themes'
import Routes from './routes';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Routes/>
  </React.StrictMode>
);