import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ Use 'react-dom/client' for React 18+
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
