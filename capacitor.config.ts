import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.civlink.app',
  appName: 'CivLInc',
  webDir: 'dist', 
  server: { 
    url: 'http://localhost:3000',  // <--- ADD THIS EXACT LINE
    cleartext: true              // <--- ADD THIS EXACT LINE TOO
  }
};

export default config;
