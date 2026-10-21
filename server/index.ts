import { resolve } from 'node:path'
import express, { type NextFunction, type Request, type Response } from 'express'
import type { StorageAdapter } from './storage'
import { createPostgresStorage } from './postgres-storage'
import { createAdminLoginHandler } from '../netlify/functions/_admin-auth'
import { createContentGetHandler } from '../netlify/functions/content-get'
import { createContentSaveHandler } from '../netlify/functions/content-save'
import { createContentHistoryHandler } from '../netlify/functions/content-history'
import { createContentRestoreHandler } from '../netlify/functions/content-restore'
import { createContentResetHandler } from '../netlify/functions/content-reset'
import { createMediaUploadHandler } from '../netlify/functions/media-upload'
import { createMediaGetHandler } from '../netlify/functions/media-get'
import { createMediaDeleteHandler } from '../netlify/functions/media-delete'

type WebHandler = (request: globalThis.Request) => Promise<globalThis.Response>

function toWebRequest(request: Request): globalThis.Request {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value)
  }
  headers.set('x-nf-client-connection-ip', request.ip || 'unknown')
  const host = request.get('host') ?? 'localhost'
  const body = request.body instanceof Buffer ? new Uint8Array(request.body) : undefined
  const method = request.method.toUpperCase()
  return new globalThis.Request(`${request.protocol}://${host}${request.originalUrl}`, {
    method,
    headers,
    ...(body && method !== 'GET' && method !== 'HEAD' ? { body, duplex: 'half' } : {}),
  })
}

function route(handler: WebHandler, forceQuery?: string) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      if (forceQuery) request.originalUrl = `${request.path}?${forceQuery}`
      const result = await handler(toWebRequest(request))
      response.status(result.status)
      result.headers.forEach((value, name) => response.setHeader(name, value))
      const bytes = new Uint8Array(await result.arrayBuffer())
      response.send(Buffer.from(bytes))
    } catch (error) {
      next(error)
    }
  }
}

function mediaPathRoute(handler: WebHandler) {
  const handle = route(handler)
  return (request: Request, response: Response, next: NextFunction) => {
    const url = new URL(request.originalUrl, `${request.protocol}://${request.get('host') ?? 'localhost'}`)
    url.searchParams.set('id', request.params.id)
    request.originalUrl = `${url.pathname}${url.search}`
    return handle(request, response, next)
  }
}

function registerAliases(app: ReturnType<typeof express>, name: string, handler: WebHandler, forceQuery?: string) {
  const paths = [`/api/${name}`, `/.netlify/functions/${name}`]
  for (const path of paths) app.all(path, route(handler, forceQuery))
}

function createApp(storage: StorageAdapter) {
  const app = express()
  app.set('trust proxy', 1)

  const handlers = {
    'content-get': createContentGetHandler(storage),
    'admin-login': createAdminLoginHandler(storage),
    'content-save': createContentSaveHandler(storage),
    'content-history': createContentHistoryHandler(storage),
    'content-restore': createContentRestoreHandler(storage),
    'content-reset': createContentResetHandler(storage),
    'media-upload': createMediaUploadHandler(storage),
    'media-get': createMediaGetHandler(storage),
    'media-delete': createMediaDeleteHandler(storage),
  }

  app.get('/healthz', async (_request, response) => {
    try {
      await storage.healthCheck()
      response.setHeader('Cache-Control', 'no-store')
      response.status(200).send('ok')
    } catch {
      response.setHeader('Cache-Control', 'no-store')
      response.status(503).send('database unavailable')
    }
  })
  app.use(express.raw({ type: () => true, limit: '4mb' }))

  registerAliases(app, 'content-get', handlers['content-get'])
  registerAliases(app, 'admin-login', handlers['admin-login'])
  registerAliases(app, 'content-save', handlers['content-save'])
  registerAliases(app, 'content-history', handlers['content-history'])
  registerAliases(app, 'content-restore', handlers['content-restore'])
  registerAliases(app, 'content-reset', handlers['content-reset'])
  registerAliases(app, 'media-upload', handlers['media-upload'])
  registerAliases(app, 'media-get', handlers['media-get'])
  registerAliases(app, 'media-list', handlers['media-get'], 'list=1')
  registerAliases(app, 'media-delete', handlers['media-delete'])
  app.get('/media/:id', mediaPathRoute(handlers['media-get']))
  app.head('/media/:id', mediaPathRoute(handlers['media-get']))
  app.get('/api/media/:id', mediaPathRoute(handlers['media-get']))
  app.head('/api/media/:id', mediaPathRoute(handlers['media-get']))

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large') {
      response.setHeader('Cache-Control', 'no-store')
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.status(413).json({ error: 'File must be no larger than 4 MB' })
      return
    }
    console.error('[server] request failed')
    response.setHeader('Cache-Control', 'no-store')
    response.status(500).json({ error: 'Internal server error' })
  })

  app.use(express.static(resolve(process.cwd(), 'dist'), { index: false }))
  app.use((request: Request, response: Response) => {
    if (
      request.path === '/api'
      || request.path.startsWith('/api/')
      || request.path === '/.netlify/functions'
      || request.path.startsWith('/.netlify/functions/')
    ) {
      response.setHeader('Cache-Control', 'no-store')
      response.status(404).json({ error: 'Not found' })
      return
    }
    response.sendFile(resolve(process.cwd(), 'dist', 'index.html'))
  })
  return app
}

async function start() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required')
  const storage = await createPostgresStorage(connectionString)
  const port = Number(process.env.PORT ?? 3000)
  createApp(storage).listen(port, () => {
    console.log(`Portfolio service listening on port ${port}`)
  })
}

function safeErrorDetails(error: unknown) {
  const record = typeof error === 'object' && error !== null
    ? error as { code?: unknown; message?: unknown; cause?: unknown }
    : {}
  const cause = typeof record.cause === 'object' && record.cause !== null
    ? record.cause as { code?: unknown; message?: unknown }
    : undefined
  const code = cause?.code ?? record.code
  let message = typeof cause?.message === 'string'
    ? cause.message
    : typeof record.message === 'string'
      ? record.message
      : 'Unknown startup error'

  const sensitiveValues = [
    process.env.DATABASE_URL,
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_TOKEN_SECRET,
    process.env.DATABASE_CA,
  ].filter((value): value is string => Boolean(value))
  if (process.env.DATABASE_URL) {
    try {
      const databaseUrl = new URL(process.env.DATABASE_URL)
      sensitiveValues.push(databaseUrl.username, databaseUrl.password)
    } catch {
      // An invalid URL will be reported without echoing its input value.
    }
  }
  for (const value of sensitiveValues.filter(Boolean)) message = message.split(value).join('[redacted]')
  message = message.replace(/(?:postgres|postgresql):\/\/[^\s/@]+@[^\s/]+/gi, 'postgresql://[redacted]')
  message = message.replace(/password authentication failed for user ["'][^"']+["']/i, 'password authentication failed (database credentials rejected)')

  return { code: code === undefined ? 'unknown' : String(code), message }
}

void start().catch((error: unknown) => {
  const details = safeErrorDetails(error)
  if (details.code === '42501') {
    console.error('[server] Database role lacks permission to create tables in the public schema.')
  }
  console.error('[server] startup failed.', `code=${details.code}`, `message=${details.message}`)
  process.exitCode = 1
})
