// env.js
const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const API_URL = isReactNative
  ? "https://jrl.onrender.com" // mobile hardcoded
  : import.meta.env.VITE_API_URL; // web pulls from .env
