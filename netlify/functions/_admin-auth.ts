import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import type { StorageAdapter } from '../../server/storage'
import { netlifyStorage } from './_storage'

const NO_STORE = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' }
const TOKEN_LIFETIME_SECONDS = 2 * 60 * 60
const FAILURE_WINDOW_MS = 15 * 60 * 1000
const FAILURE_LIMIT = 5

type SignedClaims = { sub: 'admin'; exp: number; nonce: string }

export function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...NO_STORE, ...extraHeaders },
  })
}

function digest(value: string) {
  return createHash('sha256').update(value).digest()
}

function constantTimeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right))
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createAdminToken(secret: string): string {
  const claims: SignedClaims = {
    sub: 'admin',
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    nonce: randomUUID(),
  }
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

export function isAuthorized(request: Request): boolean {
  const authorization = request.headers.get('authorization') ?? ''
  const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(authorization)
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!match || !secret) return false

  const [payload, signature] = match[1].split('.')
  if (!payload || !signature || !constantTimeEqual(sign(payload, secret), signature)) return false

  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<SignedClaims>
    return claims.sub === 'admin' && typeof claims.exp === 'number' && claims.exp > Date.now() / 1000
  } catch {
    return false
  }
}

export function clientIp(request: Request) {
  const netlifyIp = request.headers.get('x-nf-client-connection-ip')?.trim()
  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return netlifyIp || forwardedIp || 'unknown'
}

function failureKey(ip: string) {
  return `admin-login-failures/${createHash('sha256').update(ip).digest('hex')}`
}

export function createAdminLoginHandler(storage: StorageAdapter) {
  return async function handleAdminLogin(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }

  try {
  const password = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!password || !secret) return jsonResponse({ error: 'Admin authentication is not configured' }, 503)

  const key = failureKey(clientIp(request))
  const now = Date.now()
  if (await storage.isRateLimited(key, now, FAILURE_LIMIT)) {
    return jsonResponse({ error: 'Too many failed attempts. Try again later.' }, 429)
  }

  let submitted = ''
  try {
    const body: unknown = await request.json()
    if (typeof body === 'object' && body !== null && 'password' in body && typeof body.password === 'string') {
      submitted = body.password
    }
  } catch {
    submitted = ''
  }

  if (constantTimeEqual(password, submitted)) {
    await storage.clearLoginFailures(key)
    return jsonResponse({ token: createAdminToken(secret), expiresIn: TOKEN_LIFETIME_SECONDS })
  }

  const failures = await storage.recordLoginFailure(key, now, FAILURE_WINDOW_MS)
  await new Promise((resolve) => setTimeout(resolve, 350))
  if (failures.count >= FAILURE_LIMIT) {
    return jsonResponse({ error: 'Too many failed attempts. Try again later.' }, 429)
  }
  return jsonResponse({ error: 'Invalid password' }, 401)
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
  }
}

export const handleAdminLogin = createAdminLoginHandler(netlifyStorage)

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export { NO_STORE }
