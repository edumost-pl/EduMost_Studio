import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppBootstrap } from '@/components/AppBootstrap';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { I18nProvider } from '@/i18n';
import { NavigationProvider } from '@/context/NavigationContext';
import { ShellProvider } from '@/context/ShellContext';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppBootstrap>
        <HashRouter>
          <I18nProvider>
            <NavigationProvider>
              <ShellProvider>
                <App />
              </ShellProvider>
            </NavigationProvider>
          </I18nProvider>
        </HashRouter>
      </AppBootstrap>
    </ErrorBoundary>
  </StrictMode>,
);
