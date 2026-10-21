declare module 'express' {
  import type { IncomingHttpHeaders, Server } from 'node:http'

  export interface Request {
    method: string
    originalUrl: string
    path: string
    protocol: string
    ip: string
    params: Record<string, string>
    headers: IncomingHttpHeaders
    body: unknown
    get(name: string): string | undefined
  }

  export interface Response {
    status(code: number): this
    setHeader(name: string, value: string): this
    send(body?: string | Buffer | Uint8Array): this
    json(value: unknown): this
    sendFile(path: string): void
  }

  export type NextFunction = (error?: unknown) => void
  export type Handler = (request: Request, response: Response, next: NextFunction) => unknown

  export interface Express {
    set(name: string, value: unknown): this
    use(...handlers: unknown[]): this
    all(path: string, handler: Handler): this
    get(path: string, handler: Handler): this
    head(path: string, handler: Handler): this
    listen(port: number, callback: () => void): Server
  }

  export interface RawOptions {
    type: string | ((request: Request) => boolean)
    limit: string
  }

  export interface StaticOptions {
    index?: boolean
  }

  interface ExpressFactory {
    (): Express
    raw(options: RawOptions): Handler
    static(root: string, options?: StaticOptions): Handler
  }

  const express: ExpressFactory
  export default express
}

declare module 'pg' {
  export interface QueryResult<Row> {
    rows: Row[]
  }

  export class Pool {
    constructor(config: {
      connectionString: string
      ssl: false | { rejectUnauthorized: boolean; ca?: string }
      max: number
      connectionTimeoutMillis: number
      idleTimeoutMillis: number
    })
    query<Row = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<QueryResult<Row>>
  }
}
