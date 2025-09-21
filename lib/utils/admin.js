const normalizeEmail = email => {
  if (!email || typeof email !== 'string') return null
  return email.trim().toLowerCase() || null
}

export const normalizeAdminEmails = rawAdminEmails => {
  if (!rawAdminEmails) return []

  if (Array.isArray(rawAdminEmails)) {
    return rawAdminEmails
      .map(normalizeEmail)
      .filter(Boolean)
  }

  if (typeof rawAdminEmails === 'string') {
    return rawAdminEmails
      .split(',')
      .map(normalizeEmail)
      .filter(Boolean)
  }

  return []
}

export const isAdminEmail = (email, rawAdminEmails) => {
  const normalized = normalizeAdminEmails(rawAdminEmails)
  const target = normalizeEmail(email)
  if (!target) return false
  return normalized.includes(target)
}
