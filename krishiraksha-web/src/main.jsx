import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#f43f5e', fontSize: '18px', fontWeight: 'bold', margin: '0 0 12px 0' }}>UI Render Error</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' }}>An unexpected error occurred while loading this view:</p>
            <pre style={{ background: '#020617', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString() || 'Unknown error'}
            </pre>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.location.reload()} style={{ background: '#10b981', color: '#020617', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Reload Page
              </button>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#334155', color: '#f8fafc', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Clear Cache & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <OfflineProvider>
          <App />
        </OfflineProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
