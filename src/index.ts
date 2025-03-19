import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { initSwagger } from './routes/swagger.js'
import { registerRoutes } from './routes/routes.js'
import { logger } from 'hono/logger'
import { auth } from './firebase.js'
import { cors } from 'hono/cors'

export const app = new OpenAPIHono()
initSwagger()
app.use(logger())
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:8081'],
  })
)
registerRoutes()
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Firebase initalized: ${auth.app.name}`);
  console.log(`Server is running on http://localhost:${info.port}`)
})
