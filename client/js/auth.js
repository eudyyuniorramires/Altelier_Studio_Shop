import { api } from './api.js';

const AUTH_STORAGE_KEY = 'atelier_auth_user_v1';

class AuthService {
  constructor() {
    this.user = this.#loadUser();
  }

  #loadUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  #saveUser(user) {
    if (user) {
      user.name = user.fullName || user.name || 'Cliente';
      user.fullName = user.name;
      this.user = user;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      this.user = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { user: this.user } }));
  }

  getCurrentUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.user;
  }

  async login(email, password) {
    const response = await api.login(email, password);
    this.#saveUser(response);
    return response;
  }

  async register(registrationData) {
    const response = await api.register(registrationData);
    this.#saveUser(response);
    return response;
  }

  logout() {
    this.#saveUser(null);
  }

  /**
   * Renderiza el estado de autenticación en la barra de navegación (Header)
   */
  initNavAuth(containerId = 'nav-auth-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const render = () => {
      if (this.user) {
        const fullName = this.user.fullName || this.user.name || 'Cliente';
        const initials = fullName
          .split(' ')
          .map(n => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'U';

        const roleBadge = this.user.role && this.user.role !== 'Customer'
          ? `<span class="header__auth-badge">${this.user.role}</span>`
          : '';

        container.innerHTML = `
          <div class="header__auth-user" data-testid="nav-user-greeting">
            <div class="header__auth-avatar" title="${fullName}">${initials}</div>
            <div class="header__auth-info">
              <span class="header__auth-welcome">Hola,</span>
              <strong class="header__auth-name" data-testid="nav-user-name">${fullName}</strong>
              ${roleBadge}
            </div>
            <button class="header__auth-logout" id="nav-logout-btn" data-testid="nav-logout-btn" type="button" title="Cerrar sesión">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        `;

        document.getElementById('nav-logout-btn')?.addEventListener('click', () => {
          this.logout();
          if (window.location.pathname.includes('checkout')) {
            window.location.href = 'index.html';
          } else {
            window.location.reload();
          }
        });
      } else {
        container.innerHTML = `
          <div class="header__auth-guest" data-testid="nav-guest-actions">
            <a href="login.html" class="header__auth-btn header__auth-btn--login" data-testid="nav-login-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Iniciar Sesión</span>
            </a>
            <a href="register.html" class="header__auth-btn header__auth-btn--register" data-testid="nav-register-link">
              <span>Registrarse</span>
            </a>
          </div>
        `;
      }
    };

    render();
    window.addEventListener('auth:changed', render);
  }
}

export const auth = new AuthService();
