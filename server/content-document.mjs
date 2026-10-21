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

export function applyVersionedContentSave(existing, currentVersion, incoming, expectedVersion) {
  if (currentVersion !== expectedVersion) return { status: 409 }

  return {
    status: 200,
    content: mergeContentDocuments(existing ?? {}, incoming),
    version: currentVersion + 1,
  }
}
