import { Pool } from 'pg'
import type { HistoryVersion, LoginFailureState, ManagedStorage, MediaMetadata, MediaRecord } from './storage'
import { applyVersionedContentSave } from './content-document.mjs'

function postgresTlsOptions(hostname: string): false | { rejectUnauthorized: boolean; ca?: string } {
  const ca = process.env.DATABASE_CA
  if (ca) return { ca, rejectUnauthorized: true }

  const host = hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') return false

  if (host.endsWith('.supabase.com') || host.endsWith('.supabase.co')) {
    return { rejectUnauthorized: false }
  }

  return { rejectUnauthorized: true }
}

export function createPostgresStorage(connectionString: string): ManagedStorage {
  const databaseUrl = new URL(connectionString)
  const hostname = databaseUrl.hostname
  for (const key of ['sslmode', 'sslrootcert', 'sslcert', 'sslkey']) {
    databaseUrl.searchParams.delete(key)
  }
  const pool = new Pool({
    connectionString: databaseUrl.toString(),
    ssl: postgresTlsOptions(hostname),
    max: 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  })

  return {
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.kv (
          key text PRIMARY KEY,
          value jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.media (
          id uuid PRIMARY KEY,
          name text NOT NULL,
          type text NOT NULL,
          size integer NOT NULL,
          data bytea NOT NULL,
          created_at timestamptz NOT NULL DEFAULT NOW()
        );
        INSERT INTO public.kv (key, value)
        VALUES ('content-version', '0'::jsonb)
        ON CONFLICT (key) DO NOTHING;
      `)
    },
    async close() {
      await pool.end()
    },
    async healthCheck() {
      await pool.query('SELECT 1')
    },
    async getContent() {
      const result = await pool.query<{ value: unknown }>('SELECT value FROM kv WHERE key = $1', ['content'])
      return result.rows[0]?.value ?? null
    },
    async getContentVersion() {
      const result = await pool.query<{ value: unknown }>('SELECT value FROM kv WHERE key = $1', ['content-version'])
      const value = result.rows[0]?.value
      return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0
    },
    async commitContent(value, expectedVersion) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const versionResult = await client.query<{ value: unknown }>(
          'SELECT value FROM kv WHERE key = $1 FOR UPDATE',
          ['content-version'],
        )
        const storedVersion = versionResult.rows[0]?.value
        const currentVersion = typeof storedVersion === 'number' ? storedVersion : 0
        const contentResult = await client.query<{ value: unknown }>(
          'SELECT value FROM kv WHERE key = $1',
          ['content'],
        )
        const previous = contentResult.rows[0]?.value ?? null
        const result = applyVersionedContentSave(previous, currentVersion, value, expectedVersion)
        if (result.status === 409) {
          await client.query('ROLLBACK')
          return result
        }

        if (previous !== null) {
          const historyResult = await client.query<{ value: HistoryVersion[] }>(
            'SELECT value FROM kv WHERE key = $1',
            ['content-history'],
          )
          const history = Array.isArray(historyResult.rows[0]?.value) ? historyResult.rows[0].value : []
          history.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), data: previous })
          await client.query(
            `INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
            ['content-history', JSON.stringify(history.slice(-10))],
          )
        }
        await client.query(
          `INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          ['content', JSON.stringify(result.content)],
        )
        await client.query(
          'UPDATE kv SET value = $1::jsonb, updated_at = NOW() WHERE key = $2',
          [JSON.stringify(result.version), 'content-version'],
        )
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    async setContent(value) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query(
          `INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          ['content', JSON.stringify(value)],
        )
        await client.query(
          `INSERT INTO kv (key, value, updated_at) VALUES ($1, '1'::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = (kv.value::text::bigint + 1)::text::jsonb, updated_at = NOW()`,
          ['content-version'],
        )
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    async deleteContent() {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await client.query('DELETE FROM kv WHERE key = $1', ['content'])
        await client.query(
          `INSERT INTO kv (key, value, updated_at) VALUES ($1, '1'::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = (kv.value::text::bigint + 1)::text::jsonb, updated_at = NOW()`,
          ['content-version'],
        )
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    async getHistory() {
      const result = await pool.query<{ value: HistoryVersion[] }>('SELECT value FROM kv WHERE key = $1', ['content-history'])
      const value = result.rows[0]?.value
      return Array.isArray(value) ? value : []
    },
    async setHistory(versions) {
      await pool.query(
        `INSERT INTO kv (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        ['content-history', JSON.stringify(versions.slice(-10))],
      )
    },
    async isRateLimited(key, now, limit) {
      const result = await pool.query<{ value: LoginFailureState }>('SELECT value FROM kv WHERE key = $1', [key])
      const state = result.rows[0]?.value
      return Boolean(state && state.expiresAt > now && state.count >= limit)
    },
    async recordLoginFailure(key, now, windowMs) {
      const result = await pool.query<{ value: LoginFailureState }>(
        `INSERT INTO kv (key, value, updated_at)
         VALUES ($1, jsonb_build_object('count', 1, 'expiresAt', $2::bigint + $3::bigint), NOW())
         ON CONFLICT (key) DO UPDATE SET
           value = CASE
             WHEN (kv.value->>'expiresAt')::bigint > $2::bigint
               THEN jsonb_set(kv.value, '{count}', to_jsonb((kv.value->>'count')::integer + 1))
             ELSE jsonb_build_object('count', 1, 'expiresAt', $2::bigint + $3::bigint)
           END,
           updated_at = NOW()
         RETURNING value`,
        [key, now, windowMs],
      )
      return result.rows[0].value
    },
    async clearLoginFailures(key) {
      await pool.query('DELETE FROM kv WHERE key = $1', [key])
    },
    async getMedia(id) {
      const result = await pool.query<{ name: string; type: string; size: number; data: Buffer }>(
        'SELECT name, type, size, data FROM media WHERE id = $1',
        [id],
      )
      const item = result.rows[0]
      return item
        ? { id, name: item.name, type: item.type, size: item.size, data: new Uint8Array(item.data) }
        : null
    },
    async putMedia(media: MediaRecord) {
      await pool.query(
        'INSERT INTO media (id, name, type, size, data) VALUES ($1, $2, $3, $4, $5)',
        [media.id, media.name, media.type, media.size, Buffer.from(media.data)],
      )
    },
    async deleteMedia(id) {
      await pool.query('DELETE FROM media WHERE id = $1', [id])
    },
    async listMedia() {
      const result = await pool.query<MediaMetadata>(
        'SELECT id::text AS id, name, type, size FROM media ORDER BY created_at DESC',
      )
      return result.rows
    },
  }
}
