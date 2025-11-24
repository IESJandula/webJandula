# 🌐 Proyecto Web IES Jándula

Desarrollo del sitio web del **IES Jándula**, realizado con:

- **Frontend:** [Astro](https://astro.build)
- **Backend:** [Strapi v5 (TypeScript)](https://strapi.io)
- **Gestor de paquetes:** pnpm
- **Control de versiones:** Git + GitHub

---

## 🚀 Estructura del Proyecto

```
IESJandula/
├─ backend/        → API, CMS y base de datos (Strapi)
├─ frontend/       → Sitio público (Astro)
└─ README.md       → Este documento
```

---

## ⚙️ Requisitos Previos

Cada miembro del equipo debe tener instalado:

| Herramienta | Versión recomendada | Descripción |
|--------------|--------------------|--------------|
| **Node.js** | LTS 20.x | Usar con [nvm](https://github.com/coreybutler/nvm-windows) o nvm-windows |
| **pnpm** | v10 o superior | Gestor de paquetes (`corepack use pnpm@10`) |
| **Git** | Última estable | Para clonar y versionar el proyecto |
| **Docker (opcional)** | Latest | Solo si se usa PostgreSQL en lugar de SQLite |

### 💡 Windows
- Evitar carpetas sincronizadas con Google Drive / OneDrive.  
  Recomendado: `C:\Projects\IESJandula`
- Activar **Modo de programador** en Windows (para que pnpm pueda crear symlinks):  
  *Configuración → Privacidad y seguridad → Para desarrolladores → Modo de programador → Activar*

---

## 🧩 Instalación

1️⃣ **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/IESJandula.git
cd IESJandula
```

2️⃣ **Instalar dependencias**
```bash
corepack enable
corepack use pnpm@10
pnpm install
```

---

## 🔑 Variables de Entorno

Cada entorno tiene su propio archivo `.env`:

**frontend/.env**
```
PUBLIC_API_URL=http://localhost:1337
```

> En Astro, todas las variables que empiecen por `PUBLIC_` estarán disponibles en el navegador.

**backend/.env**
> Si usas SQLite (modo por defecto con `--quickstart`), **no necesitas crear nada**.  
> Para Postgres o MySQL, se definen aquí las credenciales.

---

## 🧠 Scripts disponibles

### Desde la raíz (monorepo)
```bash
pnpm dev       # Levanta FRONT y BACK a la vez
pnpm build     # Construye ambos proyectos
```

### Individualmente

#### Backend (Strapi)
```bash
cd backend
pnpm develop   # Modo desarrollo (SQLite por defecto)
pnpm build     # Compila
pnpm start     # Producción
```
👉 http://localhost:1337/admin

#### Frontend (Astro)
```bash
cd frontend
pnpm dev       # Servidor de desarrollo
pnpm build     # Genera la versión estática
pnpm preview   # Vista previa de producción
```
👉 http://localhost:4321

---

## 🔗 Conexión entre Astro y Strapi

El frontend obtiene los datos de Strapi mediante la variable `PUBLIC_API_URL`.

Ejemplo de uso en `frontend/src/lib/api.ts`:
```ts
const API = import.meta.env.PUBLIC_API_URL;

export async function getNoticias() {
  const res = await fetch(`${API}/api/noticias?populate=*`);
  if (!res.ok) throw new Error("Error al cargar noticias");
  return res.json();
}
```

---

## ⚙️ Configuración CORS en Strapi

Archivo: `backend/config/middlewares.ts`
```ts
export default [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://localhost:4321'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
      credentials: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

---

## 👥 Primer uso (para cada compañero)

1. Arrancar el backend:
   ```bash
   cd backend
   pnpm develop
   ```
   Abre: [http://localhost:1337/admin](http://localhost:1337/admin)

2. Crear su **usuario administrador local** (solo la primera vez).

3. Arrancar el frontend:
   ```bash
   cd frontend
   pnpm dev
   ```
   Abre: [http://localhost:4321](http://localhost:4321)

4. En el panel de Strapi, dar permisos públicos a las colecciones:
    - `Settings → Users & Permissions → Roles → Public`
    - Activar `find` y `findOne` para las colecciones visibles.

---

## 🧹 Archivos ignorados (.gitignore)

- `.idea/` (IntelliJ)
- `node_modules/`
- `.tmp/`, `.cache/`, `build/`, `dist/`
- `.env` y `.env.*`
- `*.db` (SQLite local)
- `backend/public/uploads/*` (solo se deja `.gitkeep`)

---

## ⚡ Solución de Problemas

| Problema | Solución |
|-----------|-----------|
| `EISDIR` o `symlink` en Windows | Activar “Modo programador” o mover el proyecto fuera de Google Drive |
| `astro no se reconoce como comando` | Ejecutar `pnpm install` en `frontend` |
| CORS bloqueado | Revisar `backend/config/middlewares.ts` |
| Error de base de datos | Borrar `.tmp/data.db` y reiniciar Strapi |

---

## 🧱 Tecnologías principales

| Tecnología | Uso |
|-------------|-----|
| **Astro** | Frontend estático rápido y modular |
| **Strapi v5** | CMS Headless + API REST |
| **TailwindCSS** | Estilos en el frontend |
| **TypeScript** | Tipado fuerte (en backend y front) |
| **pnpm** | Gestión de dependencias monorepo |
| **Git + GitHub** | Control de versiones y colaboración |

---

## 📦 Estructura sugerida de colecciones (Strapi)

- **noticias**
    - `titulo` (Text)
    - `slug` (UID)
    - `cuerpo` (Rich Text)
    - `portada` (Media)
    - `fecha` (Date)

- **eventos**
    - `titulo`, `descripcion`, `fecha`, `lugar`, `cartel` (Media)

---

## 🧑‍💻 Contribución del equipo

1. Crear una rama con tu nombre o funcionalidad:
   ```bash
   git checkout -b desarrollo-x
   ```
2. Hacer commits descriptivos:
   ```
   DESARROLLO: Nueva sección de noticias
   ```
3. Subir cambios:
   ```bash
   git push origin desarrollo-x
   ```
4. Abrir **Pull Request** en GitHub para revisión antes de fusionar con `main`.
