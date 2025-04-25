
import { createRoot } from 'react-dom/client'
import { AppProvider } from './contexts/AppContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
