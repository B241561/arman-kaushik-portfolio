export function mergeContentDocuments(existing: unknown, incoming: unknown): unknown
export function applyVersionedContentSave(
  existing: unknown,
  currentVersion: number,
  incoming: unknown,
  expectedVersion: number,
): { status: 409 } | { status: 200; content: unknown; version: number }
