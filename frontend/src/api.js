const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function apiGet(path, params) {
  const url = new URL(API_BASE + path);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, params) {
  const url = new URL(API_BASE + path);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const createSession = (hostName) => apiPost('/session/create', { host_name: hostName });
export const joinSession = (sessionId, userName) => apiPost('/session/join', { session_id: sessionId, user_name: userName });
export const startSession = (sessionId, hostId) => apiPost('/session/start', { session_id: sessionId, host_id: hostId });
export const endSession = (sessionId, hostId) => apiPost('/session/end', { session_id: sessionId, host_id: hostId });
export const listMovies = (sessionId) => apiGet('/movies/list', { session_id: sessionId });
export const swipeMovie = (sessionId, userId, movieId, action) => apiPost('/swipe', { session_id: sessionId, user_id: userId, movie_id: movieId, action });
export const getMatchResult = (sessionId) => apiGet('/match/result', { session_id: sessionId });
export const listUsers = (sessionId) => apiGet('/session/users', { session_id: sessionId });
export const getSwipeProgress = (sessionId) => apiGet('/swipe/progress', { session_id: sessionId });

export { API_BASE };
