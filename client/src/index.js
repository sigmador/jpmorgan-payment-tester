import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Wait for DOM to be ready
const initializeApp = () => {
    const rootElement = document.getElementById('root');

    if (!rootElement) {
        console.error('Root element not found! Cannot mount React app.');
        return;
    }

    console.log('Root element found, mounting React app...');

    try {
        // React 18 style
        const root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('React app mounted successfully!');
    } catch (error) {
        console.error('Error mounting React app:', error);

        // Fallback: Show error in the DOM
        rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; gap: 20px; padding: 40px; font-family: sans-serif;">
        <div style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; max-width: 600px; width: 100%;">
          <h2 style="color: #991b1b; margin-bottom: 10px;">Failed to Initialize Application</h2>
          <p style="color: #7f1d1d; margin-bottom: 15px;">${error.message}</p>
          <p style="color: #7f1d1d; font-size: 14px;">Please try refreshing the page or contact support.</p>
        </div>
      </div>
    `;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}