const KEY = 'moviematch_session'

export function saveSession(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data))
}

export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
}
