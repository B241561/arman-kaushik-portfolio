export function mergeContentDocuments(existing: unknown, incoming: unknown): unknown
export function parseContentRevision(value: unknown):
  | { valid: true; revision: number }
  | { valid: false; receivedType: string }
export function applyVersionedContentSave(
  existing: unknown,
  currentVersion: number,
  incoming: unknown,
  expectedVersion: number,
): { status: 409 } | { status: 200; content: unknown; version: number }
