import { api } from './api.js';
import { cart } from './cart.js';
import { auth } from './auth.js';
import {
  createProductCardElement,
  renderCartDrawerContent,
  showToast
} from './ui.js';

/**
 * Catálogo de respaldo local por si el backend aún no se ha levantado
 */
const FALLBACK_PRODUCTS = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Blazer Oversize Lana Merino",
    description: "Confeccionado en fina lana merino italiana con corte sastre contemporáneo.",
    price: 185.00,
    originalPrice: 220.00,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
    category: "Camperas",
    stock: 18,
    isFeatured: true,
    availableSizes: ["S", "M", "L"],
    availableColors: ["#111827", "#c5a880"]
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Trench Coat Clásico Gabardina",
    description: "Impermeable clásico con doble abotonadura y cinturón a juego.",
    price: 240.00,
    originalPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop",
    category: "Camperas",
    stock: 12,
    isFeatured: true,
    availableSizes: ["XS", "S", "M", "L"],
    availableColors: ["#d4b996", "#111827"]
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Remera Cuello Caja Algodón Pima",
    description: "Básico de lujo tejido en 100% algodón Pima peruano.",
    price: 45.00,
    originalPrice: 55.00,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
    category: "Remeras",
    stock: 45,
    isFeatured: false,
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: ["#ffffff", "#111827", "#9ca3af"]
  },
  {
    id: "d4e5f6a7-b8c9-0123-def1-234567890123",
    name: "Remera Oversize Washed Heavyweight",
    description: "Algodón peinado pesado de 280 GSM con proceso vintage.",
    price: 52.00,
    originalPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop",
    category: "Remeras",
    stock: 30,
    isFeatured: true,
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["#374151", "#4b5563"]
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef12-345678901234",
    name: "Pantalón Wide Leg Sastrería",
    description: "Pantalón de tiro alto con pinzas frontales pronunciadas y caída fluida.",
    price: 110.00,
    originalPrice: 135.00,
    imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop",
    category: "Pantalones",
    stock: 22,
    isFeatured: true,
    availableSizes: ["XS", "S", "M", "L"],
    availableColors: ["#111827", "#e5e7eb"]
  },
  {
    id: "f6a7b8c9-d0e1-2345-f123-456789012345",
    name: "Vestido Midi Slip en Satén de Seda",
    description: "Vestido cortado al bies que esculpe la figura con sutil elegancia.",
    price: 160.00,
    originalPrice: 195.00,
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
    category: "Vestidos",
    stock: 14,
    isFeatured: true,
    availableSizes: ["XS", "S", "M"],
    availableColors: ["#111827", "#059669"]
  }
];

class App {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.activeCategory = '';
    this.activeSort = 'featured';

    this.initElements();
    this.bindEvents();
    this.loadCatalog();
    this.syncCartUI();
    auth.initNavAuth('nav-auth-container');
  }

  initElements() {
    this.container = document.getElementById('products-container');
    this.filterCategory = document.getElementById('filter-category');
    this.filterSort = document.getElementById('filter-sort');
    this.cartDrawer = document.getElementById('cart-drawer');
    this.cartOverlay = document.getElementById('cart-overlay');
    this.openCartBtn = document.getElementById('open-cart-btn');
    this.closeCartBtn = document.getElementById('close-cart-btn');
    this.cartCounter = document.getElementById('cart-counter');
  }

  bindEvents() {
    // Apertura y Cierre del Side-Drawer
    if (this.openCartBtn) {
      this.openCartBtn.addEventListener('click', () => this.openCart());
    }
    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.closeCart());
    }
    if (this.cartOverlay) {
      this.cartOverlay.addEventListener('click', () => this.closeCart());
    }

    // Tecla Escape para cerrar drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.cartDrawer?.classList.contains('cart-drawer--open')) {
        this.closeCart();
      }
    });

    // Filtros y ordenamiento
    if (this.filterCategory) {
      this.filterCategory.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.applyFiltersAndSort();
      });
    }

    if (this.filterSort) {
      this.filterSort.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.applyFiltersAndSort();
      });
    }

    // Enlaces de navegación de categorías
    const navCategoryLinks = document.querySelectorAll('.header__nav-link[data-category]');
    navCategoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.dataset.category;
        this.activeCategory = cat;
        if (this.filterCategory) this.filterCategory.value = cat;
        this.applyFiltersAndSort();
        document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Escuchar actualizaciones de carrito globales
    window.addEventListener('cart:updated', () => {
      this.syncCartUI();
    });

    // Interceptar botón de checkout del drawer: requiere login obligatorio
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cart.getItems().length === 0) {
          showToast('Carrito Vacío', 'Agrega prendas antes de proceder al pago.', 'warning');
          return;
        }
        if (!auth.isAuthenticated()) {
          showToast('Autenticación Requerida', 'Por favor inicia sesión o regístrate para procesar tu compra.', 'info', 3000);
          setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout.html';
          }, 350);
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }
  }

  openCart() {
    this.cartDrawer?.classList.add('cart-drawer--open');
    this.cartOverlay?.classList.add('cart-drawer-overlay--active');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    this.cartDrawer?.classList.remove('cart-drawer--open');
    this.cartOverlay?.classList.remove('cart-drawer-overlay--active');
    document.body.style.overflow = '';
  }

  syncCartUI() {
    const items = cart.getItems();
    const count = cart.getItemCount();

    if (this.cartCounter) {
      this.cartCounter.textContent = count;
      // Animación de bump
      this.cartCounter.classList.remove('header__cart-badge--bump');
      void this.cartCounter.offsetWidth; // Forzar reflow
      this.cartCounter.classList.add('header__cart-badge--bump');
    }

    renderCartDrawerContent(
      items,
      (id, qty) => cart.updateQuantity(id, qty),
      (id) => cart.removeItem(id)
    );
  }

  async loadCatalog() {
    try {
      // Intenta consultar la RESTful API
      const data = await api.getProducts();
      this.products = Array.isArray(data) && data.length > 0 ? data : FALLBACK_PRODUCTS;
    } catch {
      console.info('[ATELIER] Usando catálogo local predefinido.');
      this.products = FALLBACK_PRODUCTS;
    }

    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let result = [...this.products];

    // Filtro por categoría
    if (this.activeCategory) {
      result = result.filter(p => p.category.toLowerCase() === this.activeCategory.toLowerCase());
    }

    // Ordenamiento
    switch (this.activeSort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    this.filteredProducts = result;
    this.renderCatalog();
  }

  renderCatalog() {
    if (!this.container) return;

    if (this.filteredProducts.length === 0) {
      this.container.innerHTML = `
        <div class="products-grid__state-msg">
          <p>No se encontraron prendas para la selección actual.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';

    this.filteredProducts.forEach(product => {
      const card = createProductCardElement(product, (p, size, color) => {
        cart.addItem(p, size, color, 1);
        showToast('Prenda Añadida', `${p.name} (Talle: ${size}) fue añadida a tu carrito.`, 'success');
        this.openCart();
      });

      this.container.appendChild(card);
    });
  }
}

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
