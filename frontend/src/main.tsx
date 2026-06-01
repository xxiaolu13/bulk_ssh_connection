import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@arco-design/web-react/dist/css/arco.css';
import 'xterm/css/xterm.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './styles/theme-modern.css';
import './styles/components/Navigation.css';
import './styles/components/Layout.css';
import './styles/components/Cards.css';
import './styles/components/Tables.css';
import './styles/components/Forms.css';
import './styles/components/PageHeader.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
