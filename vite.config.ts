import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "https://ecommerce-api-dev-1063728289659.us-central1.run.app",
        changeOrigin: true,
      },
    },
  },
})
