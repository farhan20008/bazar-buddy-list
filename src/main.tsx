
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { GroceryProvider } from '@/contexts/GroceryContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LanguageProvider>
      <GroceryProvider>
        <App />
      </GroceryProvider>
    </LanguageProvider>
  </AuthProvider>
);
