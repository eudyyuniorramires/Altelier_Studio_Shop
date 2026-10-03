import { api } from './api.js';
import { cart } from './cart.js';
import { formatCurrency, showToast } from './ui.js';
import { CONFIG } from './config.js';
import { auth } from './auth.js';

/**
 * Módulo de Gestión de Checkout y Pasarela de Pagos (Stripe JS / Vanilla JS)
 */
class CheckoutPage {
  constructor() {
    // Si el usuario no está registrado o logueado, redirigir a Login con redirección a Checkout
    if (!auth.isAuthenticated()) {
      window.location.replace('login.html?redirect=checkout.html');
      return;
    }

    this.cartItems = cart.getItems();
    this.subtotal = cart.getSubtotal();
    this.stripe = null;
    this.isProcessing = false;

    this.initElements();
    this.initUserSession();
    this.renderOrderSummary();
    this.initStripe();
    this.bindEvents();
  }

  initElements() {
    this.form = document.getElementById('checkout-form');
    this.btnPay = document.getElementById('btn-pay-now');
    this.btnPayText = document.getElementById('btn-pay-text');
    this.itemsList = document.getElementById('checkout-items-list');
    this.subtotalEl = document.getElementById('checkout-subtotal');
    this.totalEl = document.getElementById('checkout-total');
    this.cardErrors = document.getElementById('card-errors');

    // Inputs de tarjeta
    this.cardNumberInput = document.getElementById('card-number');
    this.cardExpiryInput = document.getElementById('card-expiry');
    this.cardCvcInput = document.getElementById('card-cvc');
  }

  initUserSession() {
    auth.initNavAuth('nav-auth-container');
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      const nameInput = document.getElementById('customer-name');
      const emailInput = document.getElementById('customer-email');
      const addressInput = document.getElementById('shipping-address');
      const cityInput = document.getElementById('shipping-city');
      const zipInput = document.getElementById('shipping-zip');

      const fullName = currentUser.fullName || currentUser.name || '';
      if (nameInput && !nameInput.value) nameInput.value = fullName;
      if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';

      const street = currentUser.street || currentUser.address?.street || '';
      const city = currentUser.city || currentUser.address?.city || '';
      const postalCode = currentUser.postalCode || currentUser.address?.postalCode || '';

      if (addressInput && !addressInput.value) addressInput.value = street;
      if (cityInput && !cityInput.value) cityInput.value = city;
      if (zipInput && !zipInput.value) zipInput.value = postalCode;
    }
  }

  renderOrderSummary() {
    if (!this.itemsList) return;

    if (this.cartItems.length === 0) {
      this.itemsList.innerHTML = `
        <div style="text-align: center; padding: 2rem 0; color: var(--color-text-muted);">
          <p>No tienes prendas seleccionadas para comprar.</p>
          <a href="index.html" style="color: var(--color-primary); font-weight: 600; text-decoration: underline; display: inline-block; margin-top: 8px;">Volver al catálogo</a>
        </div>
      `;
      if (this.btnPay) this.btnPay.disabled = true;
      return;
    }

    this.itemsList.innerHTML = this.cartItems.map(item => `
      <div style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
        <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px;">
        <div style="flex: 1;">
          <div style="font-size: var(--font-size-sm); font-weight: 600;">${item.name}</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Talle: ${item.selectedSize} | Cant: ${item.quantity}</div>
        </div>
        <div style="font-weight: 600; font-size: var(--font-size-sm);">${formatCurrency(item.price * item.quantity)}</div>
      </div>
    `).join('');

    if (this.subtotalEl) this.subtotalEl.textContent = formatCurrency(this.subtotal);
    if (this.totalEl) this.totalEl.textContent = formatCurrency(this.subtotal);
  }

  initStripe() {
    // Inicializar Stripe.js si está cargado en window
    if (typeof window.Stripe !== 'undefined') {
      try {
        this.stripe = window.Stripe(CONFIG.STRIPE.PUBLISHABLE_KEY);
      } catch (e) {
        console.warn('Modo simulación Stripe activo.', e);
      }
    }

    // Formateo visual del input de tarjeta (grupos de 4 números)
    if (this.cardNumberInput) {
      this.cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        const parts = val.match(/.{1,4}/g);
        e.target.value = parts ? parts.join(' ') : '';
      });
    }

    // Formateo de fecha de expiración MM / AA
    if (this.cardExpiryInput) {
      this.cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
          e.target.value = val.substring(0, 2) + ' / ' + val.substring(2, 4);
        } else {
          e.target.value = val;
        }
      });
    }
  }

  bindEvents() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  validateForm() {
    let isValid = true;

    // Validación de campos de envío
    const fields = [
      { id: 'customer-name', errorId: 'error-customerName', validate: (v) => v.trim().length >= 3 },
      { id: 'customer-email', errorId: 'error-customerEmail', validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
      { id: 'shipping-address', errorId: 'error-address', validate: (v) => v.trim().length >= 5 },
      { id: 'shipping-city', errorId: 'error-city', validate: (v) => v.trim().length >= 2 },
      { id: 'shipping-zip', errorId: 'error-postalCode', validate: (v) => v.trim().length >= 2 }
    ];

    fields.forEach(({ id, errorId, validate }) => {
      const input = document.getElementById(id);
      const errorMsg = document.getElementById(errorId);
      if (!input || !errorMsg) return;

      if (!validate(input.value)) {
        input.classList.add('form-input--error');
        errorMsg.classList.add('form-error-msg--visible');
        isValid = false;
      } else {
        input.classList.remove('form-input--error');
        errorMsg.classList.remove('form-error-msg--visible');
      }
    });

    // Validación de tarjeta
    const rawCardNum = this.cardNumberInput?.value.replace(/\s/g, '') || '';
    if (rawCardNum.length < 13) {
      if (this.cardErrors) {
        this.cardErrors.textContent = 'Ingresa un número de tarjeta válido.';
        this.cardErrors.classList.add('form-error-msg--visible');
      }
      this.cardNumberInput?.classList.add('form-input--error');
      isValid = false;
    } else {
      this.cardNumberInput?.classList.remove('form-input--error');
      if (this.cardErrors) this.cardErrors.classList.remove('form-error-msg--visible');
    }

    return isValid;
  }

  setProcessingState(isProcessing, message = 'Procesando Pago Seguro...') {
    this.isProcessing = isProcessing;
    if (this.btnPay) {
      this.btnPay.disabled = isProcessing;
      if (this.btnPayText) {
        this.btnPayText.textContent = isProcessing ? message : 'Confirmar y Pagar';
      }
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (this.isProcessing) return;

    if (!this.validateForm()) {
      showToast('Datos Incompletos', 'Por favor revisa los campos señalados en rojo.', 'warning');
      return;
    }

    if (this.cartItems.length === 0) {
      showToast('Carrito Vacío', 'Agrega prendas antes de proceder al pago.', 'warning');
      return;
    }

    this.setProcessingState(true);

    try {
      // 1. Preparar Payload para la Orden en Backend
      const orderPayload = {
        customerName: document.getElementById('customer-name').value.trim(),
        customerEmail: document.getElementById('customer-email').value.trim(),
        street: document.getElementById('shipping-address').value.trim(),
        city: document.getElementById('shipping-city').value.trim(),
        postalCode: document.getElementById('shipping-zip').value.trim(),
        country: 'Argentina',
        items: this.cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        }))
      };

      // 2. Crear la orden en la API (Estado: Pending)
      let orderResponse;
      try {
        orderResponse = await api.createOrder(orderPayload);
      } catch (err) {
        // Fallback para simulación si la API no está corriendo
        console.warn('API offline: simulando orden de prueba.');
        orderResponse = {
          id: 'mock-order-' + Date.now(),
          orderNumber: 'ORD-' + Math.floor(Math.random() * 900000 + 100000),
          totalAmount: this.subtotal
        };
      }

      const rawCard = this.cardNumberInput.value.replace(/\s/g, '');
      const cardLast4 = rawCard.slice(-4) || '4242';

      // 3. Tokenización segura (Stripe SDK o Token de prueba para backend)
      // Generamos el paymentToken compatible con la regla del backend:
      // Si termina en 0002 o 0069 simula tarjeta declinada
      let paymentToken = `tok_visa_${cardLast4}`;

      // 4. Invocar endpoint del backend para procesar el pago y cambiar estado a 'Paid'
      this.setProcessingState(true, 'Verificando con el banco...');

      try {
        const paymentResult = await api.processPayment({
          orderId: orderResponse.id,
          paymentToken: paymentToken,
          cardLast4: cardLast4
        });

        // 5. ¡PAGO APROBADO EXITOSAMENTE!
        this.handlePaymentSuccess(orderResponse, paymentResult);

      } catch (paymentError) {
        // 6. ¡TARJETA DECLINADA / RECHAZADA! Manejo de error amigable en el DOM
        this.handlePaymentDecline(paymentError);
      }

    } catch (globalError) {
      console.error('Error durante el checkout:', globalError);
      showToast('Error en la Solicitud', globalError.message || 'No se pudo conectar con el servidor.', 'error');
      this.setProcessingState(false);
    }
  }

  handlePaymentSuccess(order, paymentResult) {
    // Vaciar el carrito en localStorage
    cart.clear();

    // Guardar referencia del último pedido
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_ORDER, JSON.stringify({
      orderNumber: order.orderNumber,
      amount: order.totalAmount || this.subtotal,
      date: new Date().toISOString()
    }));

    showToast('¡Pago Aprobado!', `Tu orden #${order.orderNumber} fue procesada exitosamente.`, 'success', 6000);

    // Reemplazar la vista con la confirmación de compra elegante
    const mainContainer = document.querySelector('.checkout-page');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div data-testid="payment-success-card" style="max-width: 640px; margin: 4rem auto; text-align: center; background: #fff; padding: 3rem 2rem; border-radius: 12px; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background-color: var(--color-success-bg); color: var(--color-success); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style="font-family: var(--font-family-heading); font-size: 2rem; margin-bottom: 0.5rem;">¡Gracias por tu compra!</h2>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Tu pedido ha sido recibido y se encuentra en preparación.</p>
          
          <div style="background: var(--color-bg-subtle); padding: 1.5rem; border-radius: 8px; text-align: left; margin-bottom: 2rem; font-size: 0.9rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: var(--color-text-muted);">Número de Orden:</span>
              <strong data-testid="success-order-number">${order.orderNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: var(--color-text-muted);">Estado del Pago:</span>
              <strong style="color: var(--color-success);">Aprobado (Paid)</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--color-text-muted);">Total Pagado:</span>
              <strong data-testid="success-total-paid">${formatCurrency(order.totalAmount || this.subtotal)}</strong>
            </div>
          </div>

          <a href="index.html" class="btn-submit-payment" data-testid="back-to-catalog-btn" style="text-decoration: none; display: inline-flex; width: auto; padding: 0.8rem 2rem;">
            Volver a la Colección
          </a>
        </div>
      `;
    }
  }

  handlePaymentDecline(error) {
    this.setProcessingState(false);

    const errorMessage = error.message || 'Tu tarjeta fue declinada por el banco emisor.';

    // Mostrar alerta amigable en el DOM (en el contenedor de errores de la tarjeta)
    if (this.cardErrors) {
      this.cardErrors.textContent = `Transacción Declinada: ${errorMessage}`;
      this.cardErrors.classList.add('form-error-msg--visible');
      this.cardErrors.style.padding = '8px 12px';
      this.cardErrors.style.backgroundColor = 'var(--color-error-bg)';
      this.cardErrors.style.borderRadius = '4px';
      this.cardErrors.style.marginTop = '8px';
    }

    if (this.cardNumberInput) {
      this.cardNumberInput.classList.add('form-input--error');
      this.cardNumberInput.focus();
    }

    // Notificación Toast de error
    showToast(
      'Pago Declinado',
      errorMessage,
      'error',
      6000
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CheckoutPage();
});
