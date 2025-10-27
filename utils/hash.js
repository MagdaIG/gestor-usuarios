const bcrypt = require('bcryptjs');

// Leer rondas desde variables de entorno o usar valor por defecto
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Genera hash de una contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Error al generar hash de contraseña');
  }
};

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} - True si la contraseña es correcta
 */
const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error al verificar contraseña');
  }
};

/**
 * Verifica si una contraseña es segura
 * @param {string} password - Contraseña a verificar
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    errors.push('La contraseña es requerida');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  SALT_ROUNDS
};
