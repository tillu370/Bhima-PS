import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Public (browser-safe) variables only. NEXT_PUBLIC_* and WHATSAPP_* are accepted too, so an
// existing .env / Vercel setup keeps working. Never expose a service_role or sb_secret_ key.
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'WHATSAPP_'],
  server: { port: 5173 }
});
