export function mergeContentDocuments(existing, incoming) {
  if (
    typeof existing === 'object' && existing !== null && !Array.isArray(existing) &&
    typeof incoming === 'object' && incoming !== null && !Array.isArray(incoming)
  ) {
    const merged = { ...existing }
    for (const [key, value] of Object.entries(incoming)) {
      merged[key] = key in existing
        ? mergeContentDocuments(existing[key], value)
        : value
    }
    return merged
  }

  return incoming
}

export function parseContentRevision(value) {
  if (value === undefined) return { valid: true, revision: 0 }

  const revision = typeof value === 'string' && value.trim() !== ''
    ? Number(value)
    : value
  if (typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0) {
    const receivedType = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
    return { valid: false, receivedType }
  }

  return { valid: true, revision }
}

export function applyVersionedContentSave(existing, currentVersion, incoming, expectedVersion) {
  if (expectedVersion < currentVersion) return { status: 409 }

  return {
    status: 200,
    content: mergeContentDocuments(existing ?? {}, incoming),
    version: currentVersion + 1,
  }
}
