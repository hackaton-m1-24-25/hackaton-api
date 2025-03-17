import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { initSwagger } from './routes/swagger.js'
import { registerRoutes } from './routes/routes.js'
import { logger } from 'hono/logger'
import { db } from './firebase.js'

export const app = new OpenAPIHono()
app.use(logger())
initSwagger()
registerRoutes()

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(db.app.name);
  console.log(`Server is running on http://localhost:${info.port}`)
})
