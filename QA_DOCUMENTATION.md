# Guía de Pruebas QA y Automatización E2E con Playwright
## E-Commerce ATELIER STUDIO

Documento técnico oficial para Ingenieros de Calidad de Software (QA Engineers, SDETs y Automatizadores) para la ejecución de pruebas funcionales, no funcionales y automatizadas E2E utilizando **Playwright**.

---

## 1. Arquitectura y Reglas del Negocio

| Parámetro | Detalle |
| :--- | :--- |
| **URL Base Aplicación Web** | `http://localhost:5000` (sirve frontend Vanilla JS y Backend) |
| **Ruta Catálogo Principal** | `http://localhost:5000/index.html` |
| **Ruta Inicio de Sesión** | `http://localhost:5000/login.html` |
| **Ruta Registro de Usuario** | `http://localhost:5000/register.html` |
| **Ruta Pasarela de Pago** | `http://localhost:5000/checkout.html` (**Protegida por Autenticación**) |
| **Swagger UI (Endpoints API)** | `http://localhost:5000/swagger` |
| **Persistencia de Sesión** | `localStorage` (`atelier_auth_user_v1`, `atelier_fashion_cart_v1`) |

### Regla de Negocio Crítica: Autenticación Obligatoria para Compras
1. **Acceso al Catálogo:** Libre y público. Cualquier usuario puede explorar prendas, filtrar por categoría, cambiar tallas y colores, y añadirlas a su carrito.
2. **Proceder al Pago:** **Requiere Autenticación Obligatoria**.
   - Si un usuario no registrado o sin sesión activa pulsa *"Iniciar Compra"* / *"Proceder al Pago"* en el carrito o intenta acceder directamente a `/checkout.html`, el sistema lo redirige de inmediato a `/login.html?redirect=checkout.html`.
   - En la página de Login se muestra el banner informativo: *"🛒 Inicia sesión o regístrate para proceder con el pago seguro de tu compra."*
   - Al iniciar sesión con éxito (o registrar una cuenta nueva), el sistema redirige automáticamente al usuario de regreso a `checkout.html` conservando las prendas en el carrito.
   - En el formulario de Checkout, los datos de envío (Nombre, Email, Dirección, Ciudad, Código Postal) se prellenan de forma automática con la información del usuario autenticado.
3. **Barra Superior (Header):**
   - **Usuario No Autenticado (Invitado):** Muestra de forma clara los botones **"Iniciar Sesión"** y **"Registrarse"**.
   - **Usuario Autenticado:** Muestra el avatar con iniciales, saludo con el **Nombre Completo del Usuario** (`Hola, Sofía Martínez`) y un botón para **"Salir"** (Cerrar Sesión).

---

## 2. Matriz de Credenciales de Prueba (Test Credentials)

Todas las cuentas se encuentran precargadas en la semilla de datos (`DbInitializer.cs`) lista para su uso inmediato.

### 2.1 Cuentas Válidas e Inválidas

| Tipo de Prueba | Correo Electrónico (`Email`) | Contraseña (`Password`) | Nombre Registrado | Rol | Estado | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Usuario Estándar** *(Happy Path)* | `standard_user@atelier.com` | `Secret123!` | Secret123! | Customer | Activo | **200 OK** - Login exitoso. Header muestra: `Hola, Sofía Martínez`. En checkout prellena Av. Santa Fe 1234, C1059. |
| **Usuario VIP** *(Happy Path)* | `vip_user@atelier.com` | `Secret123!` | Mateo Rossi | VIP | Activo | **200 OK** - Login exitoso. Header muestra: `Hola, Mateo Rossi` con insignia `VIP`. |
| **Administrador** *(Permisos)* | `admin_user@atelier.com` | `AdminPass123!` | Valentina Herrera | Admin | Activo | **200 OK** - Header muestra: `Hola, Valentina Herrera` con insignia `ADMIN`. |
| **Cuenta Bloqueada** *(Negative Path)* | `locked_user@atelier.com` | `Secret123!` | Carlos Benítez | Customer | Bloqueado (`IsLocked = true`) | **403 Forbidden** - Código `ACCOUNT_LOCKED`. Alerta visible: *"Tu cuenta se encuentra bloqueada por motivos de seguridad..."* |
| **Contraseña Incorrecta** *(Negative Path)* | `standard_user@atelier.com` | `ClaveInvalida999!` | Sofía Martínez | Customer | Activo | **401 Unauthorized** - Código `INVALID_CREDENTIALS`. Alerta: *"La contraseña ingresada es incorrecta."* |
| **Usuario Inexistente** *(Negative Path)* | `no_existe_qa@atelier.com` | `Secret123!` | N/A | N/A | No Registrado | **401 Unauthorized** - Alerta: *"No existe ninguna cuenta asociada a este correo."* |
| **Email Inválido (Formato)** *(Form Validation)* | `correo_sin_arroba.com` | `Secret123!` | N/A | N/A | N/A | **Validación Cliente** - Campo con borde rojo, mensaje `Ingresa un correo electrónico válido`, formulario bloqueado. |
| **Contraseña Vacía** *(Form Validation)* | `standard_user@atelier.com` | ` ` (vacía) | N/A | N/A | N/A | **Validación Cliente** - Campo con borde rojo, mensaje `Ingresa tu contraseña`, formulario bloqueado. |

### 2.2 Casos de Prueba de Registro (`/register.html`)

| Caso de Prueba | Payload de Entrada | Resultado Esperado |
| :--- | :--- | :--- |
| **Registro Exitoso** | Nombre: `Lucía Méndez`<br>Email: `lucia.mendez.qa.${Date.now()}@atelier.com`<br>Pass: `NuevaPass123!`<br>Dirección: `Av. Santa Fe 2341, CABA` | **201 Created** - Sesión iniciada automáticamente, almacenamiento en `localStorage`, redirección al destino (si venía de checkout, redirige a `checkout.html`). |
| **Email Duplicado** | Email: `standard_user@atelier.com` | **400 Bad Request** - Alerta en pantalla: *"El correo electrónico ya se encuentra registrado."* |
| **Contraseña Corta** | Password: `12345` (< 6 caracteres) | **Validación Cliente** - Mensaje: *"La contraseña debe tener mínimo 6 caracteres"*. |

---

## 3. Matriz de Tarjetas de Crédito de Prueba (Stripe Simulation)

| Caso de Prueba | Número de Tarjeta | Expiración | CVC | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- |
| **Pago Aprobado (Visa)** *(Happy Path)* | `4242 4242 4242 4242` | `12/28` | `123` | **200 OK** - Pago aprobado. Carrito vaciado. Muestra tarjeta de confirmación `#ORD-XXXXXX` con estado `Aprobado (Paid)`. |
| **Tarjeta Declinada / Fondos Insuficientes** *(Negative Path)* | `4000 0000 0000 0002` | `12/28` | `123` | **400 Bad Request** - Muestra alerta `Transacción Declinada: Tu tarjeta fue declinada por fondos insuficientes o rechazo bancario (simulado).` El usuario permanece en checkout para reintentar. |
| **Tarjeta Expirada** *(Negative Path)* | `4000 0000 0000 0069` | `12/28` | `123` | **400 Bad Request** - Muestra alerta `Transacción Declinada: Tu tarjeta ha expirado o los datos son inválidos (simulado).` |

---

## 4. Diccionario de Localizadores Playwright (`data-testid`)

Para garantizar tests estables, mantenibles y desacoplados del diseño visual, utiliza `page.getByTestId(...)`.

### 4.1 Barra de Navegación y Cabecera Global
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `brand-logo` | `<a>` | Enlace al inicio / Home |
| `nav-auth-container` | `<div>` | Contenedor dinámico de estado de sesión |
| `nav-guest-actions` | `<div>` | Contenedor de botones para invitados (sin sesión) |
| `nav-login-link` | `<a>` | Botón "Iniciar Sesión" en la barra superior |
| `nav-register-link` | `<a>` | Botón "Registrarse" en la barra superior |
| `nav-user-greeting` | `<div>` | Contenedor con avatar, nombre del usuario y botón de salida |
| `nav-user-name` | `<strong>` | Nombre del usuario autenticado en la barra |
| `nav-logout-btn` | `<button>` | Botón "Salir" (Cerrar Sesión) |
| `open-cart-btn` | `<button>` | Botón para abrir el Drawer lateral del carrito |
| `cart-counter` | `<span>` | Contador numérico de prendas en el carrito |

### 4.2 Catálogo y Tarjeta de Producto
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `product-card` | `<article>` | Contenedor de la tarjeta del producto |
| `product-title` | `<h3>` | Nombre del producto |
| `product-price` | `<span>` | Precio formateado |
| `size-btn-${size}` | `<button>` | Selector de talle (ej: `size-btn-M`, `size-btn-L`, `size-btn-S`) |
| `color-btn` | `<button>` | Selector de color |
| `selected-size-label` | `<span>` | Indicador de talle actualmente seleccionado |
| `add-to-cart-btn` | `<button>` | Botón "Añadir al Carrito" |

### 4.3 Drawer Lateral del Carrito
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `cart-drawer` | `<aside>` | Contenedor desplegable del carrito |
| `close-cart-btn` | `<button>` | Botón de cierre `×` del drawer |
| `cart-items-container` | `<div>` | Lista de prendas añadidas al carrito |
| `cart-item` | `<div>` | Fila individual de prenda en el carrito |
| `cart-item-name` | `<h4>` | Nombre de la prenda en la fila |
| `cart-item-qty` | `<span>` | Cantidad actual de la prenda |
| `qty-decrease-btn` | `<button>` | Botón `-` para reducir cantidad |
| `qty-increase-btn` | `<button>` | Botón `+` para incrementar cantidad |
| `remove-cart-item-btn` | `<button>` | Botón papelera para eliminar prenda |
| `cart-item-price` | `<span>` | Subtotal de esa fila de prenda |
| `cart-subtotal` | `<span>` | Subtotal acumulado del carrito |
| `cart-total` | `<span>` | Total final en el drawer |
| `cart-checkout-btn` | `<a>` | Botón "Iniciar Compra" / "Proceder al Pago" |

### 4.4 Formulario de Inicio de Sesión (`/login.html`)
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `login-card` | `<div>` | Tarjeta contenedora de login |
| `auth-redirect-notice` | `<div>` | Aviso visible cuando el usuario viene redirigido desde el checkout |
| `login-email` | `<input type="email">` | Campo de correo electrónico |
| `login-password` | `<input type="password">` | Campo de contraseña |
| `login-submit-btn` | `<button type="submit">` | Botón "Acceder a mi cuenta" |
| `login-error-alert` | `<div>` | Alerta de error (401 o 403) |
| `error-email` | `<span>` | Mensaje de validación local de email |
| `error-password` | `<span>` | Mensaje de validación local de contraseña |
| `go-to-register-link` | `<a>` | Enlace hacia `/register.html` |
| `back-to-store-link` | `<a>` | Enlace hacia `/index.html` |

### 4.5 Formulario de Registro (`/register.html`)
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `register-card` | `<div>` | Tarjeta contenedora de registro |
| `auth-redirect-notice` | `<div>` | Aviso visible cuando proviene de checkout |
| `register-name` | `<input type="text">` | Campo nombre completo |
| `register-email` | `<input type="email">` | Campo correo electrónico |
| `register-password` | `<input type="password">` | Campo contraseña |
| `register-street` | `<input type="text">` | Campo dirección de entrega |
| `register-city` | `<input type="text">` | Campo ciudad |
| `register-zip` | `<input type="text">` | Campo código postal |
| `register-submit-btn` | `<button type="submit">` | Botón "Crear Cuenta" |
| `register-error-alert` | `<div>` | Alerta de error backend (ej: duplicado) |
| `error-name` | `<span>` | Mensaje de validación de nombre |
| `error-email` | `<span>` | Mensaje de validación de email |
| `error-password` | `<span>` | Mensaje de validación de contraseña |
| `go-to-login-link` | `<a>` | Enlace hacia `/login.html` |

### 4.6 Pasarela y Proceso de Checkout (`/checkout.html`)
| Localizador (`data-testid`) | Elemento HTML | Propósito |
| :--- | :--- | :--- |
| `checkout-form` | `<form>` | Formulario de envío y pago |
| `checkout-name` | `<input type="text">` | Nombre del destinatario (prellenado desde el perfil) |
| `checkout-email` | `<input type="email">` | Email del cliente (prellenado) |
| `checkout-address` | `<input type="text">` | Dirección de entrega (prellenada) |
| `checkout-city` | `<input type="text">` | Ciudad de entrega (prellenada) |
| `checkout-zip` | `<input type="text">` | Código postal (prellenado) |
| `card-number` | `<input type="text">` | Número de tarjeta de crédito |
| `card-expiry` | `<input type="text">` | Fecha de expiración (MM/AA) |
| `card-cvc` | `<input type="text">` | Código de seguridad CVC |
| `card-errors` | `<span>` | Contenedor de errores de pago |
| `btn-pay-now` | `<button type="submit">` | Botón "Confirmar y Pagar" |
| `checkout-items-list` | `<div>` | Lista de prendas en el resumen |
| `checkout-subtotal` | `<span>` | Subtotal de compra |
| `checkout-shipping` | `<span>` | Costo de envío |
| `checkout-total` | `<span>` | Total a pagar |
| `payment-success-card` | `<div>` | Tarjeta de felicitación tras pago exitoso |
| `success-order-number` | `<strong>` | Código de orden generada (`ORD-XXXXXX`) |
| `success-total-paid` | `<strong>` | Importe final cobrado |
| `back-to-catalog-btn` | `<a>` | Botón para retornar a la colección |

---

## 5. Ejemplos de Scripts Automatizados en Playwright

### 5.1 Suite de Autenticación y Header (`tests/auth.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Módulo de Autenticación & Header - ATELIER STUDIO', () => {
  const BASE_URL = 'http://localhost:5000';

  test('TC-AUTH-01: Usuario anónimo visualiza botones "Iniciar Sesión" y "Registrarse" en el header', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page.getByTestId('nav-login-link')).toBeVisible();
    await expect(page.getByTestId('nav-register-link')).toBeVisible();
    await expect(page.getByTestId('nav-user-greeting')).not.toBeVisible();
  });

  test('TC-AUTH-02: Inicio de sesión exitoso muestra el nombre del usuario en el header', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);

    await page.getByTestId('login-email').fill('standard_user@atelier.com');
    await page.getByTestId('login-password').fill('Secret123!');
    await page.getByTestId('login-submit-btn').click();

    // Redirección al catálogo
    await expect(page).toHaveURL(`${BASE_URL}/index.html`);

    // El header debe mostrar el saludo con el nombre completo y botón salir
    await expect(page.getByTestId('nav-user-greeting')).toBeVisible();
    await expect(page.getByTestId('nav-user-name')).toHaveText('Sofía Martínez');
    await expect(page.getByTestId('nav-logout-btn')).toBeVisible();
    await expect(page.getByTestId('nav-login-link')).not.toBeVisible();
  });

  test('TC-AUTH-03: Rechazo con código 403 al intentar acceder con cuenta bloqueada', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    await page.getByTestId('login-email').fill('locked_user@atelier.com');
    await page.getByTestId('login-password').fill('Secret123!');
    await page.getByTestId('login-submit-btn').click();

    const alert = page.getByTestId('login-error-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('bloqueada');
    await expect(page).toHaveURL(/.*login\.html/);
  });

  test('TC-AUTH-04: Cierre de sesión (Logout) restaura los botones de login y registro en el header', async ({ page }) => {
    // Iniciar sesión
    await page.goto(`${BASE_URL}/login.html`);
    await page.getByTestId('login-email').fill('vip_user@atelier.com');
    await page.getByTestId('login-password').fill('Secret123!');
    await page.getByTestId('login-submit-btn').click();
    await expect(page.getByTestId('nav-user-greeting')).toBeVisible();

    // Cerrar sesión
    await page.getByTestId('nav-logout-btn').click();

    // Verificar restauración de botones de invitado
    await expect(page.getByTestId('nav-login-link')).toBeVisible();
    await expect(page.getByTestId('nav-register-link')).toBeVisible();
    await expect(page.getByTestId('nav-user-greeting')).not.toBeVisible();
  });
});
```

---

### 5.2 Suite de Flujo de Compra y Protección de Checkout (`tests/checkout.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Protección de Checkout y Flujo de Compra E2E - ATELIER STUDIO', () => {
  const BASE_URL = 'http://localhost:5000';

  test('TC-FLOW-01: Usuario anónimo que intenta proceder al pago es redirigido obligatoriamente a Login', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // 1. Añadir una prenda al carrito
    const firstProduct = page.getByTestId('product-card').first();
    await firstProduct.getByTestId('add-to-cart-btn').click();

    // 2. Abrir drawer y dar click en Proceder al Pago
    await expect(page.getByTestId('cart-drawer')).toHaveClass(/cart-drawer--open/);
    await page.getByTestId('cart-checkout-btn').click();

    // 3. El sistema DEBE redirigir a login con el parámetro de redirección
    await expect(page).toHaveURL(`${BASE_URL}/login.html?redirect=checkout.html`);
    await expect(page.getByTestId('auth-redirect-notice')).toBeVisible();
    await expect(page.getByTestId('auth-redirect-notice')).toContainText('Inicia sesión o regístrate para proceder con el pago');
  });

  test('TC-FLOW-02: Acceso directo a /checkout.html sin sesión redirige a Login inmediatamente', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout.html`);
    await expect(page).toHaveURL(`${BASE_URL}/login.html?redirect=checkout.html`);
  });

  test('TC-FLOW-03: Flujo completo: Prenda -> Redirección a Login -> Login -> Checkout prellenado -> Pago exitoso', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);

    // 1. Añadir prenda
    const firstProduct = page.getByTestId('product-card').first();
    await firstProduct.getByTestId('add-to-cart-btn').click();

    // 2. Click en checkout -> Redirige a login
    await page.getByTestId('cart-checkout-btn').click();
    await expect(page).toHaveURL(`${BASE_URL}/login.html?redirect=checkout.html`);

    // 3. Completar credenciales válidas
    await page.getByTestId('login-email').fill('standard_user@atelier.com');
    await page.getByTestId('login-password').fill('Secret123!');
    await page.getByTestId('login-submit-btn').click();

    // 4. Redirección automática de regreso a checkout.html
    await expect(page).toHaveURL(`${BASE_URL}/checkout.html`);

    // 5. El header debe mostrar el nombre del usuario y el formulario debe estar prellenado
    await expect(page.getByTestId('nav-user-name')).toHaveText('Sofía Martínez');
    await expect(page.getByTestId('checkout-name')).toHaveValue('Sofía Martínez');
    await expect(page.getByTestId('checkout-email')).toHaveValue('standard_user@atelier.com');
    await expect(page.getByTestId('checkout-address')).toHaveValue('Av. Santa Fe 1234, Piso 3 A');
    await expect(page.getByTestId('checkout-city')).toHaveValue('Buenos Aires');
    await expect(page.getByTestId('checkout-zip')).toHaveValue('C1059');

    // 6. Ingresar tarjeta aprobada y pagar
    await page.getByTestId('card-number').fill('4242 4242 4242 4242');
    await page.getByTestId('card-expiry').fill('12/28');
    await page.getByTestId('card-cvc').fill('999');
    await page.getByTestId('btn-pay-now').click();

    // 7. Confirmación de compra exitosa
    await expect(page.getByTestId('payment-success-card')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('success-order-number')).toContainText('ORD-');
    await expect(page.getByTestId('back-to-catalog-btn')).toBeVisible();
  });

  test('TC-FLOW-04: Tarjeta declinada muestra error amigable y mantiene al usuario en checkout', async ({ page }) => {
    // Iniciar sesión primero
    await page.goto(`${BASE_URL}/login.html`);
    await page.getByTestId('login-email').fill('standard_user@atelier.com');
    await page.getByTestId('login-password').fill('Secret123!');
    await page.getByTestId('login-submit-btn').click();

    // Añadir prenda e ir a checkout
    const firstProduct = page.getByTestId('product-card').first();
    await firstProduct.getByTestId('add-to-cart-btn').click();
    await page.getByTestId('cart-checkout-btn').click();
    await expect(page).toHaveURL(`${BASE_URL}/checkout.html`);

    // Tarjeta declinada
    await page.getByTestId('card-number').fill('4000 0000 0000 0002');
    await page.getByTestId('card-expiry').fill('11/27');
    await page.getByTestId('card-cvc').fill('456');
    await page.getByTestId('btn-pay-now').click();

    // Validar mensaje de error
    const cardError = page.getByTestId('card-errors');
    await expect(cardError).toBeVisible({ timeout: 10000 });
    await expect(cardError).toContainText('fondos insuficientes');
    await expect(page.getByTestId('payment-success-card')).not.toBeVisible();
  });
});
```

---

## 6. Endpoints REST API para Pruebas de Integración

### 6.1 `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "standard_user@atelier.com",
  "password": "Secret123!"
}
```
- **Response 200 OK:**
```json
{
  "userId": "433fe697-ce51-49ff-aadb-fe1554cea6f5",
  "fullName": "Sofía Martínez",
  "email": "standard_user@atelier.com",
  "role": "Customer",
  "token": "NDMzZmU2OTctY2U1MS...",
  "street": "Av. Santa Fe 1234, Piso 3 A",
  "city": "Buenos Aires",
  "postalCode": "C1059",
  "country": "Argentina"
}
```

### 6.2 `POST /api/auth/register`
- **Request Body:**
```json
{
  "fullName": "Mariana López",
  "email": "mariana.lopez@atelier.com",
  "password": "Password123!",
  "street": "Av. Callao 1540",
  "city": "Buenos Aires",
  "postalCode": "C1024",
  "country": "Argentina"
}
```

### 6.3 `POST /api/payments/process`
- **Request Body:**
```json
{
  "orderId": "<GUID_ORDEN>",
  "paymentToken": "tok_visa_4242",
  "cardLast4": "4242"
}
```
- **Response 200 OK:**
```json
{
  "paymentId": "ch_simulated_...",
  "status": "Succeeded"
}
```
