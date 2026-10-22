import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// One site, built twice: `--mode times` for times.tebonsma.no and `--mode tidsskrift` for
// tidsskrift.tebonsma.no (see .env.times and .env.tidsskrift). Each runs on its own dev port,
// next to tebonsma.no (5173) and TebBet (5174).
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { port: mode === 'tidsskrift' ? 5176 : 5175, strictPort: true },
}))
