import { apiGet, apiPost, apiPut, apiDelete } from './api.js';
import { showToast, showSpinner, hideSpinner, confirmDialog } from './ui.js';
import { validateRole, showValidationErrors, clearValidationErrors } from './validators.js';
import { roleRow, roleForm, roleModal } from './components/templates.js';

class RolesManager {
  constructor() {
    this.roles = [];
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadRoles();
  }

  setupEventListeners() {
    // Botón nuevo rol
    const newRoleBtn = document.getElementById('new-role-btn');
    if (newRoleBtn) {
      newRoleBtn.addEventListener('click', () => this.showCreateRoleModal());
    }
  }

  async loadRoles() {
    const container = document.getElementById('roles-container');
    const spinnerId = showSpinner(container);

    try {
      const response = await apiGet('/roles');
      this.roles = response.data || [];
      this.renderRoles();
    } catch (error) {
      console.error('Error cargando roles:', error);
      showToast('Error al cargar los roles', 'danger');
    } finally {
      hideSpinner(container, spinnerId);
    }
  }

  renderRoles() {
    const tbody = document.querySelector('#roles-table tbody');
    if (!tbody) return;

    if (this.roles.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-4">
            <i class="bi bi-shield-x fs-1 d-block mb-2"></i>
            No se encontraron roles
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.roles.map(role => roleRow(role)).join('');
  }

  showCreateRoleModal() {
    this.showRoleModal('create');
  }

  async showRoleModal(mode, roleId = null) {
    const modalId = `role-modal-${mode}`;
    let modal = document.getElementById(modalId);

    if (!modal) {
      document.body.insertAdjacentHTML('beforeend', roleModal(mode, roleId));
      modal = document.getElementById(modalId);
    }

    const content = modal.querySelector(`#${modalId}-content`);
    let initialData = {};

    if (mode === 'edit' && roleId) {
      try {
        const response = await apiGet(`/roles/${roleId}`);
        initialData = response.data || {};
      } catch (error) {
        console.error('Error cargando rol:', error);
        showToast('Error al cargar los datos del rol', 'danger');
        return;
      }
    }

    content.innerHTML = roleForm({ initial: initialData, mode });

    // Configurar evento del formulario
    const form = document.getElementById('role-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRoleSubmit(mode, roleId);
    });

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal al cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  async handleRoleSubmit(mode, roleId) {
    const form = document.getElementById('role-form');
    const formData = new FormData(form);

    const payload = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion')
    };

    // Validar datos
    const validation = validateRole(payload, { mode });
    if (!validation.valid) {
      showValidationErrors(form, validation.errors);
      return;
    }

    clearValidationErrors(form);

    // Deshabilitar formulario
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Procesando...';

    try {
      let response;
      if (mode === 'create') {
        response = await apiPost('/roles', payload);
      } else {
        response = await apiPut(`/roles/${roleId}`, payload);
      }

      showToast(response.message, 'success');

      // Cerrar modal
      const modal = form.closest('.modal');
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();

      // Recargar roles
      await this.loadRoles();

    } catch (error) {
      console.error('Error guardando rol:', error);

      if (error.data && error.data.errors) {
        showValidationErrors(form, error.data.errors);
      } else {
        showToast(error.message || 'Error al guardar el rol', 'danger');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async deleteRole(roleId) {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return;

    confirmDialog({
      title: 'Eliminar Rol',
      message: `¿Estás seguro de que quieres eliminar el rol <strong>${role.nombre}</strong>? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const response = await apiDelete(`/roles/${roleId}`);
          showToast(response.message, 'success');
          await this.loadRoles();
        } catch (error) {
          console.error('Error eliminando rol:', error);
          showToast(error.message || 'Error al eliminar el rol', 'danger');
        }
      }
    });
  }
}

// Funciones globales para los botones de la tabla
window.editRole = (roleId) => {
  if (window.rolesManager) {
    window.rolesManager.showRoleModal('edit', roleId);
  }
};

window.deleteRole = (roleId) => {
  if (window.rolesManager) {
    window.rolesManager.deleteRole(roleId);
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.rolesManager = new RolesManager();
});
