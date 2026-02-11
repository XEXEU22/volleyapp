
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css'; // Import Tailwind CSS
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker
registerSW({ immediate: true });

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  // Diagnostic: Check for critical env vars before rendering
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Variáveis de Ambiente Faltando: 
      URL: ${supabaseUrl ? 'OK' : 'FALTANDO'} 
      KEY: ${supabaseKey ? 'OK' : 'FALTANDO'}. 
      Por favor, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.`);
  }

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error: any) {
  console.error("Critical Initialization Error:", error);
  root.render(
    <div style={{
      padding: '20px',
      color: 'white',
      background: '#FF3B3B',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️ Erro de Inicialização</h1>
      <p style={{ maxWidth: '400px', lineHeight: '1.5' }}>
        {error.message || "Ocorreu um erro desconhecido ao carregar o aplicativo."}
      </p>
      <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.8 }}>
        Verifique as configurações na Vercel e o console do navegador.
      </p>
    </div>
  );
}
