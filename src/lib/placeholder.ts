/** A value like "[EMAIL]" is a placeholder that hasn't been filled in yet. */
export const isPlaceholder = (value?: string | null): boolean => !value || /^\[[^\]]*\]$/.test(value.trim())
