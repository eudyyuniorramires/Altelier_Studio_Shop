# ATELIER STUDIO - E-Commerce de Ropa (Clean Architecture & Vanilla Web)

Plataforma de comercio electrónico de indumentaria de alta calidad desarrollada bajo principios de **Clean Architecture (Onion)**, **SOLID** y patrones de diseño en el backend, junto con un frontend modular y responsivo desarrollado con **HTML5 semántico**, **CSS3 puro con metodología BEM** y **JavaScript nativo (ES6+)**.

---

## 1. Arquitectura de la Solución

```
                          ┌───────────────────────────┐
                          │     Presentation Layer    │
                          │   (ASP.NET Core Web API)  │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │     Application Layer     │
                          │   (Use Cases, DTOs, Svc)  │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │       Domain Layer        │
                          │  (Entities, VOs, Contratos│
                          └───────────────────────────┘
                                        ▲
                                        │
                          ┌─────────────┴─────────────┐
                          │    Infrastructure Layer   │
                          │   (EF Core, PostgreSQL,   │
                          │    Stripe Gateway Svc)    │
                          └───────────────────────────┘
```

### Principios aplicados:
- **Clean Architecture & Inversión de Dependencias (DIP):** El Dominio (`Domain`) no depende de ninguna biblioteca externa ni capa superior. La Infraestructura (`Infrastructure`) implementa las interfaces de Dominio y Aplicación.
- **Patrón Repository & Unit of Work:** Desacopla la persistencia de datos y garantiza transacciones atómicas con Entity Framework Core.
- **Single Responsibility (SRP) e Interfaces Segregadas (ISP):** Controladores delgados, servicios de aplicación específicos y contratos claros.
- **Frontend Sin Frameworks:** Cero dependencias de CSS/JS (sin Bootstrap ni Tailwind). CSS estructurado en componentes bajo convención **BEM** (`block__element--modifier`).

---

## 2. Estructura de Carpetas

```
Pagina_web/
├── docker-compose.yml               # Contenedor PostgreSQL 16
├── client/                          # FRONTEND (Vanilla Web)
│   ├── css/
│   │   ├── variables.css            # Tokens de diseño, colores y tipografía
│   │   ├── base.css                 # Reset moderno y estilos globales
│   │   ├── layout.css               # Grid responsivo y contenedores
│   │   ├── header.css               # Navbar con badge reactivo
│   │   ├── product-card.css         # Tarjetas de ropa y selectores BEM
│   │   ├── cart-drawer.css          # Side-drawer del carrito de compras
│   │   ├── checkout.css             # Formulario de checkout y pagos
│   │   ├── toast.css                # Alertas amigables en el DOM
│   │   └── main.css                 # Importador central de estilos
│   ├── js/
│   │   ├── config.js                # Variables de configuración y endpoints
│   │   ├── api.js                   # Módulo HTTP fetch con manejo de errores
│   │   ├── cart.js                  # Lógica de carrito con persistencia LocalStorage
│   │   ├── ui.js                    # Manipulación del DOM y notificaciones Toast
│   │   ├── checkout.js              # Tokenización y pasarela de pago Stripe
│   │   └── app.js                   # Inicializador y eventos del catálogo
│   ├── index.html                   # Página principal con catálogo y side-drawer
│   ├── product.html                 # Vista detallada de prenda
│   └── checkout.html                # Página de pago seguro y resumen
└── server/                          # BACKEND (ASP.NET Core Clean Architecture)
    ├── EcommerceApp.slnx
    └── src/
        ├── Domain/                  # Capa 1: Entidades, Value Objects, Enums, Contratos
        ├── Application/             # Capa 2: DTOs, Interfaces, Servicios de Negocio
        ├── Infrastructure/          # Capa 3: DbContext, PostgreSQL, Repositorios, Stripe
        └── Api/                     # Capa 4: Controladores REST, Middleware, Swagger
```

---

## 3. Puesta en Marcha Rápida

### Opción A: Modo Desarrollo Inmediato (InMemory / Sin dependencias)
El backend viene configurado por defecto con `InMemory` en `appsettings.Development.json` para probar de inmediato:

```powershell
# Compilar y ejecutar la API
dotnet run --project server/src/Api/Ecommerce.Api.csproj
```
- **API y Swagger:** Abre `http://localhost:5000/swagger`
- **Frontend Integrado:** Abre `http://localhost:5000` (el backend sirve directamente la carpeta `client/` como archivos estáticos).

### Opción B: Con Base de Datos PostgreSQL
1. Iniciar PostgreSQL con Docker:
   ```powershell
   docker compose up -d
   ```
2. Cambiar `DatabaseProvider` en `server/src/Api/appsettings.json` a `"PostgreSql"`.
3. Iniciar la API:
   ```powershell
   dotnet run --project server/src/Api/Ecommerce.Api.csproj
   ```
   La base de datos se crea e inicializa automáticamente con el catálogo inicial de prendas.

---

## 4. Pruebas del Flujo E2E y Pasarela de Pagos

1. **Explorar el Catálogo:** Filtra por categorías (Camperas, Remeras, Pantalones, Vestidos) u ordena por precio.
2. **Selección de Variantes:** Selecciona talle (XS, S, M, L, XL) y color en la tarjeta de la prenda antes de pulsar *"Añadir al Carrito"*.
3. **Carrito Side-Drawer:** Se despliega automáticamente. Puedes modificar cantidades (+ / -) y eliminar prendas. Los subtotales y totales se recalculan en tiempo real y persisten en `localStorage`.
4. **Checkout & Validación:** Haz clic en *"Iniciar Compra"*, completa el formulario con validación nativa.
5. **Pasarela de Pagos:**
   - **Pago Aprobado:** Usa cualquier tarjeta con terminación `4242` (ej. `4242 4242 4242 4242`). La orden pasará a `Paid`, se reduce el stock y verás la pantalla de confirmación.
   - **Tarjeta Declinada:** Usa una tarjeta con terminación `0002` o `0069`. El sistema capturará el rechazo y mostrará una alerta amigable en el DOM indicando que el banco emisor declinó la transacción.
  
   - <img width="1918" height="1078" alt="image" src="https://github.com/user-attachments/assets/ed13052e-9ef4-4095-9037-880119fb03eb" />

  
   - 
