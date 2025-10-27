/**
 * @fileoverview Módulo de utilidades para la interfaz de usuario
 * Contiene funciones para toasts, spinners, confirmaciones, paginación y formateo de datos
 */

import { UI_CONFIG } from './config.js';

/**
 * Muestra un toast de Bootstrap con mensaje y tipo específico
 * @param {string} message - Mensaje a mostrar en el toast
 * @param {string} type - Tipo de toast ('success', 'danger', 'warning', 'info')
 */
export function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();

  const toastId = `toast-${Date.now()}`;
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: UI_CONFIG.TOAST_DURATION
  });

  toast.show();

  // Limpiar el elemento después de que se oculte
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * Crea el contenedor de toasts si no existe
 * @returns {HTMLElement} Contenedor de toasts creado
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.style.zIndex = '1055';
  document.body.appendChild(container);
  return container;
}

/**
 * Muestra un spinner de carga en el contenedor especificado
 * @param {string|HTMLElement} container - Selector CSS o elemento DOM donde mostrar el spinner
 * @returns {string} ID del spinner creado
 */
export function showSpinner(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (!container) return;

  const spinnerId = `spinner-${Date.now()}`;
  const spinnerHtml = `
    <div id="${spinnerId}" class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;

  container.innerHTML = spinnerHtml;
  return spinnerId;
}

/**
 * Oculta el spinner de carga del contenedor especificado
 * @param {string|HTMLElement} container - Selector CSS o elemento DOM del spinner
 * @param {string} spinnerId - ID del spinner a ocultar (opcional)
 */
export function hideSpinner(container, spinnerId) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (!container) return;

  if (spinnerId) {
    const spinner = document.getElementById(spinnerId);
    if (spinner) {
      spinner.remove();
    }
  } else {
    const spinner = container.querySelector('.spinner-border');
    if (spinner) {
      spinner.closest('.d-flex').remove();
    }
  }
}

/**
 * Muestra un diálogo de confirmación
 */
export function confirmDialog({ title, message, onConfirm, onCancel }) {
  const modalId = `confirm-modal-${Date.now()}`;
  const modalHtml = `
    <div id="${modalId}" class="modal fade" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="${modalId}-label" class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="${modalId}-confirm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalElement = document.getElementById(modalId);
  const modal = new bootstrap.Modal(modalElement);

  const confirmBtn = document.getElementById(`${modalId}-confirm`);

  confirmBtn.addEventListener('click', () => {
    modal.hide();
    if (onConfirm) onConfirm();
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    modalElement.remove();
    if (onCancel) onCancel();
  });

  modal.show();
}

/**
 * Renderiza controles de paginación
 */
export function renderPagination(container, { limit, offset, total }, onChange) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }

  if (!container) return;

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let paginationHtml = '<nav aria-label="Paginación"><ul class="pagination justify-content-center">';

  // Botón anterior
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  paginationHtml += `
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>
    </li>
  `;

  // Páginas
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginationHtml += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
    if (startPage > 2) {
      paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const active = i === currentPage ? 'active' : '';
    paginationHtml += `
      <li class="page-item ${active}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }
    paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
  }

  // Botón siguiente
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  paginationHtml += `
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
    </li>
  `;

  paginationHtml += '</ul></nav>';

  container.innerHTML = paginationHtml;

  // Event listeners
  container.addEventListener('click', (e) => {
    e.preventDefault();
    const pageLink = e.target.closest('.page-link');
    if (pageLink && !pageLink.closest('.disabled')) {
      const page = parseInt(pageLink.dataset.page);
      if (page && page !== currentPage) {
        onChange(page);
      }
    }
  });
}

/**
 * Debounce para funciones
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formatea fecha
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea UUID para mostrar solo los primeros 8 caracteres
 */
export function formatUUID(uuid) {
  if (!uuid) return '';
  // Convertir a string si es un número
  const uuidStr = String(uuid);
  return uuidStr.substring(0, 8) + '...';
}
