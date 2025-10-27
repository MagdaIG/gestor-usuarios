/**
 * @fileoverview Módulo de validaciones del lado del cliente
 * Contiene funciones para validar emails, URLs, UUIDs y datos de formularios
 */

/**
 * Valida si una cadena es un email válido
 * @param {string} str - Cadena a validar
 * @returns {boolean} true si es un email válido
 */
export function isEmail(str) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Valida si una cadena tiene la longitud mínima requerida
 * @param {string} str - Cadena a validar
 * @param {number} min - Longitud mínima requerida
 * @returns {boolean} true si cumple la longitud mínima
 */
export function minLength(str, min) {
  return str && str.length >= min;
}

/**
 * Valida si una cadena es una URL válida
 * @param {string} str - Cadena a validar
 * @returns {boolean} true si es una URL válida
 */
export function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida si una cadena es un UUID válido
 */
export function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Valida los datos de un usuario
 */
export function validateUser(payload, { mode = 'create' } = {}) {
  const errors = {};

  // Validar nombre
  if (!payload.nombre || payload.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (payload.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  // Validar correo
  if (!payload.correo || !isEmail(payload.correo)) {
    errors.correo = 'Debe ser un correo electrónico válido';
  }

  // Validar contraseña
  if (mode === 'create') {
    if (!payload.password || !minLength(payload.password, 6)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
  } else if (payload.password && !minLength(payload.password, 6)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  // Validar rol principal
  if (payload.rol_id && payload.rol_id !== '' && !isUUID(payload.rol_id)) {
    errors.rol_id = 'El rol principal debe ser válido';
  }

  // Validar roles adicionales
  if (payload.rolesIds && Array.isArray(payload.rolesIds) && payload.rolesIds.length > 0) {
    const invalidRoles = payload.rolesIds.filter(roleId => roleId && roleId !== '' && !isUUID(roleId));
    if (invalidRoles.length > 0) {
      errors.rolesIds = 'Todos los roles adicionales deben ser válidos';
    }
  }

  // Validar perfil
  if (payload.profile) {
    if (payload.profile.bio && payload.profile.bio.length > 1000) {
      errors['profile.bio'] = 'La biografía no puede exceder 1000 caracteres';
    }

    if (payload.profile.avatarUrl && !isURL(payload.profile.avatarUrl)) {
      errors['profile.avatarUrl'] = 'Debe ser una URL válida';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valida los datos de un rol
 */
export function validateRole(payload, { mode = 'create' } = {}) {
  const errors = {};

  // Validar nombre
  if (!payload.nombre || payload.nombre.trim().length < 2) {
    errors.nombre = 'El nombre del rol debe tener al menos 2 caracteres';
  } else if (payload.nombre.length > 50) {
    errors.nombre = 'El nombre del rol no puede exceder 50 caracteres';
  }

  // Validar descripción
  if (payload.descripcion && payload.descripcion.length > 500) {
    errors.descripcion = 'La descripción no puede exceder 500 caracteres';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Muestra errores de validación en el formulario
 */
export function showValidationErrors(form, errors) {
  // Limpiar errores anteriores
  form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

  // Mostrar nuevos errores
  Object.keys(errors).forEach(field => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.classList.add('is-invalid');

      const feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      feedback.textContent = errors[field];

      input.parentNode.appendChild(feedback);
    }
  });
}

/**
 * Limpia errores de validación del formulario
 */
export function clearValidationErrors(form) {
  form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}
