import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// PostHog is now initialized directly in index.html via its snippet.
// The PostHogProvider is no longer needed here.
// window.posthog will be available globally.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);