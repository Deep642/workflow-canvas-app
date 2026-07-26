import axios from 'axios';
import environment from '../../environment.json';

const AUTH_TOKEN_KEY = 'workflow-canvas-token';

// Determine environment: use production config if not on localhost
const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
const apiBaseUrl = isProduction 
  ? environment.production.apiBaseUrl 
  : environment.development.apiBaseUrl;

export const api = axios.create({
  baseURL: apiBaseUrl
});

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const setAuthToken = (token: string | null) => {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
