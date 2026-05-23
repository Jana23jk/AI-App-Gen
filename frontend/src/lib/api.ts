const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Build a full URL for a backend API path (e.g. `/api/apps`). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, '')}${normalized}`;
}
