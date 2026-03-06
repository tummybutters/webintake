import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { forwardIntake } from './api/forwardIntake.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'local-intake-api',
        configureServer(server) {
          server.middlewares.use('/api/intake', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''

            req.on('data', (chunk) => {
              body += chunk
            })

            req.on('end', async () => {
              const parsedBody = body ? JSON.parse(body) : {}
              const result = await forwardIntake(parsedBody, env.INTAKE_WEBHOOK_URL)

              res.statusCode = result.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result.payload))
            })
          })
        },
      },
    ],
  }
})
