/**
 * @fileoverview Módulo de utilidades para comunicación con la API REST
 * Maneja todas las llamadas HTTP (GET, POST, PUT, DELETE) con manejo de errores centralizado
 */

import { API_CONFIG } from './config.js';

/**
 * Construye URL con parámetros de consulta
 * @param {string} path - Ruta del endpoint
 * @param {Object} params - Parámetros de consulta
 * @returns {string} URL completa con parámetros
 */
function buildURL(path, params = {}) {
  const url = new URL(API_CONFIG.BASE_URL + path);

  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });

  return url.toString();
}

/**
 * Maneja errores de la API y lanza excepciones apropiadas
 * @param {Response} response - Objeto Response de fetch
 * @param {Object} data - Datos de respuesta parseados
 * @throws {Error} Error con información detallada del fallo
 */
function handleApiError(response, data) {
  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data.success === false) {
    const error = new Error(data.message || 'Error de la API');
    error.data = data;
    throw error;
  }
}

/**
 * Realiza petición GET a la API
 * @param {string} path - Ruta del endpoint
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Object>} Datos de respuesta de la API
 * @throws {Error} Error de red o de la API
 */
export async function apiGet(path, params = {}) {
  try {
    const url = buildURL(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    handleApiError(response, data);

    return data;
  } catch (error) {
    console.error('Error en apiGet:', error);
    throw error;
  }
}

/**
 * Realiza petición POST a la API
 * @param {string} path - Ruta del endpoint
 * @param {Object} body - Datos a enviar en el cuerpo de la petición
 * @returns {Promise<Object>} Datos de respuesta de la API
 * @throws {Error} Error de red o de la API
 */
export async function apiPost(path, body = {}) {
  try {
    const response = await fetch(API_CONFIG.BASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    handleApiError(response, data);

    return data;
  } catch (error) {
    console.error('Error en apiPost:', error);
    throw error;
  }
}

/**
 * Realiza petición PUT a la API
 * @param {string} path - Ruta del endpoint
 * @param {Object} body - Datos a enviar en el cuerpo de la petición
 * @returns {Promise<Object>} Datos de respuesta de la API
 * @throws {Error} Error de red o de la API
 */
export async function apiPut(path, body = {}) {
  try {
    const response = await fetch(API_CONFIG.BASE_URL + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    handleApiError(response, data);

    return data;
  } catch (error) {
    console.error('Error en apiPut:', error);
    throw error;
  }
}

/**
 * Realiza petición DELETE a la API
 * @param {string} path - Ruta del endpoint
 * @returns {Promise<Object>} Datos de respuesta de la API
 * @throws {Error} Error de red o de la API
 */
export async function apiDelete(path) {
  try {
    const response = await fetch(API_CONFIG.BASE_URL + path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    handleApiError(response, data);

    return data;
  } catch (error) {
    console.error('Error en apiDelete:', error);
    throw error;
  }
}

/**
 * Verifica el estado de salud de la API
 * @returns {Promise<boolean>} true si la API está disponible, false en caso contrario
 */
export async function checkApiHealth() {
  try {
    const data = await apiGet(API_CONFIG.ENDPOINTS.HEALTH);
    return data.ok === true;
  } catch (error) {
    return false;
  }
}
