import { CONFIG } from './config.js';
import { auth } from './auth.js';

/**
 * Módulo de manipulación del DOM y componentes visuales en Vanilla JS
 */

/**
 * Formatea un número decimal como moneda estándar
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat(CONFIG.CURRENCY.LOCALE, {
    style: 'currency',
    currency: CONFIG.CURRENCY.CODE
  }).format(amount);
}

/**
 * Sistema amigable de notificaciones Toast en el DOM
 */
export function showToast(title, message, type = 'success', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast__icon-wrap">${iconSvg}</div>
    <div class="toast__content">
      <div class="toast__title">${title}</div>
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" aria-label="Cerrar notificación">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(element) {
    clearTimeout(timeoutId);
    element.classList.add('toast--leaving');
    element.addEventListener('animationend', () => {
      element.remove();
    });
  }
}

/**
 * Renderiza una tarjeta de producto de indumentaria con selectores interactivos de talla y color
 */
export function createProductCardElement(product, onAddToCart) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.id = product.id;
  card.dataset.category = product.category;

  card.setAttribute('data-testid', 'product-card');

  // Estado local para los selectores de la tarjeta
  let selectedSize = product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : 'M';
  let selectedColor = product.availableColors && product.availableColors.length > 0 ? product.availableColors[0] : '#111827';

  const badgeHtml = product.isFeatured
    ? `<span class="product-card__badge" data-testid="product-badge">Exclusivo</span>`
    : (product.originalPrice ? `<span class="product-card__badge product-card__badge--sale" data-testid="product-badge">Oferta</span>` : '');

  // Renderizar selectores de tallas con data-testid
  const sizesHtml = (product.availableSizes || ['S', 'M', 'L']).map((size, idx) => `
    <button type="button" 
      class="product-card__size-btn ${idx === 0 ? 'product-card__size-btn--selected' : ''}" 
      data-size="${size}"
      data-testid="size-btn-${size}">
      ${size}
    </button>
  `).join('');

  // Renderizar selectores de colores con data-testid
  const colorsHtml = (product.availableColors || ['#111827']).map((color, idx) => `
    <button type="button" 
      class="product-card__color-btn ${idx === 0 ? 'product-card__color-btn--selected' : ''}" 
      data-color="${color}" 
      style="background-color: ${color};" 
      title="Color ${color}" 
      aria-label="Color ${color}"
      data-testid="color-btn">
    </button>
  `).join('');

  card.innerHTML = `
    <div class="product-card__image-container">
      ${badgeHtml}
      <img class="product-card__image" src="${product.imageUrl}" alt="${product.name}" loading="lazy" data-testid="product-image" />
    </div>
    
    <div class="product-card__body">
      <span class="product-card__category" data-testid="product-category">${product.category}</span>
      <h3 class="product-card__title" data-testid="product-title">${product.name}</h3>
      
      <div class="product-card__price-box">
        <span class="product-card__price" data-testid="product-price">${formatCurrency(product.price)}</span>
        ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--color-text-light); font-size: var(--font-size-sm);">${formatCurrency(product.originalPrice)}</span>` : ''}
      </div>

      <div class="product-card__options">
        <div class="product-card__option-group">
          <div class="product-card__option-label">
            <span>Talle</span>
            <span class="product-card__option-selected-value selected-size-label" data-testid="selected-size-label">${selectedSize}</span>
          </div>
          <div class="product-card__sizes-list">
            ${sizesHtml}
          </div>
        </div>

        <div class="product-card__option-group">
          <div class="product-card__option-label">
            <span>Color</span>
          </div>
          <div class="product-card__colors-list">
            ${colorsHtml}
          </div>
        </div>
      </div>

      <button type="button" class="product-card__btn-add" data-testid="add-to-cart-btn" ${product.stock <= 0 ? 'disabled' : ''}>
        <svg class="product-card__btn-add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span>${product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}</span>
      </button>
    </div>
  `;

  // Interacción: Selección de Talla
  const sizeButtons = card.querySelectorAll('.product-card__size-btn');
  const sizeLabel = card.querySelector('.selected-size-label');
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('product-card__size-btn--selected'));
      btn.classList.add('product-card__size-btn--selected');
      selectedSize = btn.dataset.size;
      sizeLabel.textContent = selectedSize;
    });
  });

  // Interacción: Selección de Color
  const colorButtons = card.querySelectorAll('.product-card__color-btn');
  colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      colorButtons.forEach(b => b.classList.remove('product-card__color-btn--selected'));
      btn.classList.add('product-card__color-btn--selected');
      selectedColor = btn.dataset.color;
    });
  });

  // Evento Añadir al Carrito
  const addBtn = card.querySelector('.product-card__btn-add');
  addBtn.addEventListener('click', () => {
    if (product.stock > 0 && typeof onAddToCart === 'function') {
      onAddToCart(product, selectedSize, selectedColor);
    }
  });

  return card;
}

/**
 * Renderiza el contenido del Drawer del Carrito
 */
export function renderCartDrawerContent(items, onQuantityChange, onRemoveItem) {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const badgeEl = document.getElementById('cart-drawer-badge');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (!container) return;

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (badgeEl) badgeEl.textContent = `${totalCount} ${totalCount === 1 ? 'prenda' : 'prendas'}`;
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (totalEl) totalEl.textContent = formatCurrency(subtotal);

  if (checkoutBtn) {
    if (items.length === 0) {
      checkoutBtn.setAttribute('disabled', 'true');
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.style.opacity = '0.5';
    } else {
      checkoutBtn.removeAttribute('disabled');
      checkoutBtn.style.pointerEvents = 'auto';
      checkoutBtn.style.opacity = '1';
      checkoutBtn.href = auth.isAuthenticated() ? 'checkout.html' : 'login.html?redirect=checkout.html';
    }
  }

  // Si está vacío
  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-drawer__empty">
        <svg class="cart-drawer__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <p class="cart-drawer__empty-text">Tu carrito está vacío</p>
        <p style="font-size: var(--font-size-xs); color: var(--color-text-light);">Descubre nuestra colección y añade tus prendas favoritas.</p>
      </div>
    `;
    return;
  }

  // Renderizar lista de ítems
  container.innerHTML = '';

  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.dataset.id = item.cartItemId;
    itemEl.setAttribute('data-testid', 'cart-item');

    itemEl.innerHTML = `
      <div class="cart-item__image-wrap">
        <img class="cart-item__image" src="${item.imageUrl}" alt="${item.name}">
      </div>
      <div class="cart-item__details">
        <div class="cart-item__top">
          <h4 class="cart-item__name" data-testid="cart-item-name">${item.name}</h4>
          <button type="button" class="cart-item__remove-btn" title="Eliminar prenda" aria-label="Eliminar prenda" data-testid="remove-cart-item-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <div class="cart-item__variants">
          <span>Talle: <strong>${item.selectedSize}</strong></span> |
          <span>Color: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${item.selectedColor};vertical-align:middle;margin-left:2px;box-shadow:0 0 0 1px #ccc;"></span></span>
        </div>
        <div class="cart-item__bottom">
          <div class="cart-item__quantity-controls">
            <button type="button" class="cart-item__qty-btn qty-decrease" aria-label="Disminuir cantidad" data-testid="qty-decrease-btn">-</button>
            <span class="cart-item__qty-value" data-testid="cart-item-qty">${item.quantity}</span>
            <button type="button" class="cart-item__qty-btn qty-increase" aria-label="Aumentar cantidad" data-testid="qty-increase-btn">+</button>
          </div>
          <span class="cart-item__price" data-testid="cart-item-price">${formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    `;

    // Eventos
    const btnDecrease = itemEl.querySelector('.qty-decrease');
    const btnIncrease = itemEl.querySelector('.qty-increase');
    const btnRemove = itemEl.querySelector('.cart-item__remove-btn');

    btnDecrease.addEventListener('click', () => {
      if (typeof onQuantityChange === 'function') {
        onQuantityChange(item.cartItemId, item.quantity - 1);
      }
    });

    btnIncrease.addEventListener('click', () => {
      if (typeof onQuantityChange === 'function') {
        onQuantityChange(item.cartItemId, item.quantity + 1);
      }
    });

    btnRemove.addEventListener('click', () => {
      if (typeof onRemoveItem === 'function') {
        onRemoveItem(item.cartItemId);
      }
    });

    container.appendChild(itemEl);
  });
}
