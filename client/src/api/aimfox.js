// AimFox API calls are proxied through the backend to avoid CORS + key exposure.
// Direct browser calls to AimFox are not supported — use the /api/sync endpoint.

export const AIMFOX_NOTE = 'AimFox requests run server-side only.';
