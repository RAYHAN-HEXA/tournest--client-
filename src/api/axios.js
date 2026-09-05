import axios from "axios";

/**
 * Central axios instance. Two interceptors:
 *  - request: attach the server-issued JWT
 *  - response: on 401, clear the dead token and bounce to /login once
 */
export const api = axios.create({
  // In dev, requests are same-origin (go through the Vite dev-server proxy —
  // see server.proxy in vite.config.js), so CORS never applies locally.
  // In production builds the Vercel API URL is baked in.
  baseURL: import.meta.env.DEV
    ? ""
    : import.meta.env.VITE_API_URL || "https://tournest-server.vercel.app",
});

const TOKEN_KEY = "tournest_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

api.interceptors.request.use((config) => {
  const token = getToken();
  // Never clobber an explicit per-request Authorization header —
  // session sync sends a Firebase ID token, not our server JWT.
  const existing = config.headers?.Authorization;
  if (token && !existing) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let redirecting = false;
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only hard-redirect on 401 when we *thought* we were logged in —
    // otherwise protected-route probes during session restore would bounce.
    const hadToken = Boolean(getToken());
    if (error.response?.status === 401 && hadToken && !redirecting) {
      redirecting = true;
      setToken(null);
      window.location.href = "/login?expired=1";
    }
    return Promise.reject(error);
  }
);
