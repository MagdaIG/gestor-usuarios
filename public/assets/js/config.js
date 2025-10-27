// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  ENDPOINTS: {
    USERS: '/users',
    ROLES: '/roles',
    HEALTH: '/health'
  }
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50]
};

// Configuración de UI
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300
};
