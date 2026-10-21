export type HistoryVersion = {
  id: string
  createdAt: string
  data: unknown
}

export type LoginFailureState = {
  count: number
  expiresAt: number
}

export type MediaRecord = {
  id: string
  name: string
  type: string
  size: number
  data: Uint8Array
}

export type MediaMetadata = Omit<MediaRecord, 'data'>

export type ContentSaveResult =
  | { status: 409 }
  | { status: 200; content: unknown; version: number }

export interface StorageAdapter {
  healthCheck(): Promise<void>
  getContent(): Promise<unknown | null>
  getContentVersion(): Promise<number>
  commitContent(value: unknown, expectedVersion: number): Promise<ContentSaveResult>
  setContent(value: unknown): Promise<void>
  deleteContent(): Promise<void>
  getHistory(): Promise<HistoryVersion[]>
  setHistory(versions: HistoryVersion[]): Promise<void>
  isRateLimited(key: string, now: number, limit: number): Promise<boolean>
  recordLoginFailure(key: string, now: number, windowMs: number): Promise<LoginFailureState>
  clearLoginFailures(key: string): Promise<void>
  getMedia(id: string): Promise<MediaRecord | null>
  putMedia(media: MediaRecord): Promise<void>
  deleteMedia(id: string): Promise<void>
  listMedia(): Promise<MediaMetadata[]>
}

export interface ManagedStorage extends StorageAdapter {
  initialize(): Promise<void>
  close(): Promise<void>
}
