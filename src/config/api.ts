/**
 * Centralized API & WebSocket Endpoint Configuration
 * Supports local dev (localhost:8080) and production Render backend (https://...)
 */

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api/v1';
    }
  }
  return 'http://localhost:8080/api/v1';
};

const getWebSocketBaseUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL.replace(/\/+$/, '');
  }
  const apiUrl = getApiBaseUrl();
  if (apiUrl.startsWith('https://')) {
    return apiUrl.replace('https://', 'wss://').replace('/api/v1', '') + '/api/v1/ws';
  } else if (apiUrl.startsWith('http://')) {
    return apiUrl.replace('http://', 'ws://').replace('/api/v1', '') + '/api/v1/ws';
  }
  return `ws://${window.location.hostname}:8080/api/v1/ws`;
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWebSocketBaseUrl();
