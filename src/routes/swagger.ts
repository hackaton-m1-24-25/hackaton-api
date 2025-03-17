import { swaggerUI } from '@hono/swagger-ui'
import { app } from '../index.js'

export const localServer = { url: 'http://localhost:3000', description: 'Local Server' }

export function initSwagger() {

    app.get('/', (c) => {
        return c.redirect('/api', 301)
    })

    app.get('/swagger', (c) => {
      return c.redirect('/api', 301)
    })
    
    app.get(
      '/api',
      swaggerUI({
        url: '/docs'
      })
    )
    
    app.doc('/docs', {
      info: {
        title: 'Hackaton API',
        version: '1.0.0',
        description: 'Hackaton central API',
      },
      servers: [
        localServer
      ],
      openapi: '3.1.0'
    })
}