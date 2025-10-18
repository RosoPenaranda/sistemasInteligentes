# Asistente San Joseito – Chatbot con Integración Google Workspace

## Índice

1. [Estado actual del proyecto (POC)](#estado-actual-del-proyecto-poc)
2. [Tecnologías utilizadas](#tecnologías-utilizadas)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Instalación y configuración](#instalación-y-configuración)
5. [Ejecución](#ejecución)
6. [Autenticación con Google](#autenticación-con-google)
7. [Endpoints disponibles](#endpoints-disponibles)
8. [Cómo probar](#cómo-probar)
9. [Pruebas de salud del servidor](#pruebas-de-salud-del-servidor)
10. [Próximos pasos](#próximos-pasos-siguientes-fases-del-proyecto)
11. [Notas finales](#notas-finales)
12. [Contacto](#contacto)

El **Asistente San Joseito** es un proyecto académico desarrollado como parte del curso de *Sistemas Inteligentes*, cuyo objetivo final es implementar un **chatbot inteligente**, impulsado por **Gemini (Google AI)**, capaz de **crear, listar y gestionar eventos y notas personales** usando las APIs de **Google Calendar** y **Google Keep**.

El chatbot interpretará las intenciones del usuario y ejecutará las acciones correspondientes mediante un backend desarrollado en **Node.js + Express**, integrando autenticación OAuth 2.0 y consumo de servicios de Google.

---

##  Estado actual del proyecto (POC)
---
>  **Esta primera versión (POC)** implementa únicamente la conexión con **Google Calendar**, permitiendo **crear y listar eventos**.  
>  
> La integración con **Gemini AI** y con **Google Keep** se añadirá en fases posteriores.

---

## Tecnologías utilizadas
---
| Tecnología | Uso principal |
|-------------|----------------|
| **Node.js** (20.15)| Entorno de ejecución del servidor |
| **Express** | Framework backend para gestionar rutas y middlewares |
| **Google APIs (googleapis)** | Cliente oficial para consumir Google Calendar y autenticación OAuth |
| **dotenv** | Manejo de variables de entorno |
| **cors** | Habilitación de CORS para pruebas locales |
| **cookie-parser** | (Opcional) Manejo de cookies en el flujo OAuth |
| **fs (nativo de Node)** | Lectura y escritura del archivo `token.json` con credenciales locales |

---

##  Estructura del proyecto
---
```
sistemasInteligentes/
├── package.json
├── .env
├── token.json              # Se genera automáticamente tras la autenticación
└── src/
    ├── app.js              # Punto de entrada del servidor Express
    ├── routes/
    │   └── routes.js       # Definición de endpoints REST
    └── services/
        ├── services.js
        ├── actions/
        │   └── calendar.js # Funciones para crear y listar eventos
        └── auth/
            └── google.js   # Configuración OAuth y autenticación Google
```

---

## Instalación y configuración
---
### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/sistemasInteligentes.git
cd sistemasInteligentes
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

En la raíz del proyecto, crea un archivo `.env` con las variables de entorno de tu cliente OAuth de Google:

```bash
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3001/oauth2callback
PORT=3001
```

### 4. Crear credenciales OAuth en Google Cloud Console

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).  
2. Crea un proyecto y habilita la **Google Calendar API**.  
3. Crea credenciales → **ID de cliente OAuth 2.0** (tipo *Aplicación web*).  
4. Agrega como **orígenes autorizados de JavaScript**:
   ```
   http://localhost:3001
   ```
   Y como **URI de redirección autorizada**:
   ```
   http://localhost:3001/oauth2callback
   ```
5. En la **pantalla de consentimiento OAuth**:
   - Tipo: *External*  
   - Estado: *Testing*  
   - Añade tu cuenta como **Test User**.

---

## Ejecución
---
Inicia el servidor con:

```bash
npm run start
```

Deberías ver en consola:

```
Server on port 3001
```

---

##  Autenticación con Google
---
Antes de poder crear o listar eventos, debes autenticar tu cuenta de Google:

1. Abre en el navegador:
   ```
   http://localhost:3001/auth/google
   ```
2. Inicia sesión y acepta los permisos.
3. Se generará automáticamente el archivo `token.json` en la raíz del proyecto.
4. Verás el mensaje:
   ```
   Auth OK. Puedes usar /events
   ```

Una vez autenticado, no es necesario repetir este paso (a menos que el token expire).

---

##  Endpoints disponibles
---
### 1. Crear un evento

**POST** `http://localhost:3001/events`

#### Body JSON
```json
{
  "title": "Demo POC",
  "date": "2025-10-18",
  "startTime": "15:00",
  "endTime": "16:00",
  "timezone": "America/Bogota"
}
```

#### Ejemplo con cURL:
```bash
curl -X POST http://localhost:3001/events  -H "Content-Type: application/json"  -d '{"title":"Demo POC","date":"2025-10-18","startTime":"15:00","endTime":"16:00","timezone":"America/Bogota"}'
```

---

### 2. Listar eventos

**GET** `http://localhost:3001/events`

#### Parámetros opcionales

| Parámetro | Descripción | Ejemplo |
|------------|-------------|----------|
| `range` | `"today"`, `"tomorrow"` o `"next_days"` | `range=today` |
| `days` | Número de días hacia adelante (solo con `next_days`) | `days=5` |

#### Ejemplos de uso:

**Eventos de hoy**  
```bash
curl "http://localhost:3001/events?range=today"
```

**Eventos de mañana**  
```bash
curl "http://localhost:3001/events?range=tomorrow"
```

**Eventos próximos 3 días (por defecto)**  
```bash
curl "http://localhost:3001/events?range=next_days"
```

**Eventos próximos 7 días**  
```bash
curl "http://localhost:3001/events?range=next_days&days=7"
```

#### Ejemplo de respuesta
```json
[
  {
    "id": "abcd1234",
    "summary": "Demo POC",
    "start": { "dateTime": "2025-10-18T15:00:00-05:00" },
    "end": { "dateTime": "2025-10-18T16:00:00-05:00" }
  }
]
```

---

## Cómo probar
---
### Probar API
1. Autentícate desde el navegador (`/auth/google`).
2. Prueba los endpoints con:
   - **cURL**
   - **Postman**
   - **Thunder Client / REST Client** (en VS Code)
3. Comprueba los eventos creados directamente en tu **Google Calendar**.

---

###  Pruebas de salud del servidor
---
**GET** `http://localhost:3001/server/`  
Respuesta esperada:
```json
{ "status": "Services All Ok!" }
```

**GET** `http://localhost:3001/checkHealth`  
Respuesta esperada:
```
All Ok!
```

---

### Pruebas desde la Interfaz Web

Además de probar los endpoints desde **cURL** o **Postman**, este proyecto incluye una interfaz gráfica sencilla construida con **HTML + Bootstrap + JavaScript**, servida directamente por el backend Express.

####  Acceder a la interfaz

1. Inicia el servidor:
   ```bash
   node src/app.js
   ```
2. Abre tu navegador y entra en:
   ```
   http://localhost:3001/
   ```

Verás la **interfaz principal** del Asistente San Joseito, que incluye:

- **Autenticación con Google**  
  - Un botón para iniciar sesión con tu cuenta de Google.  
  - Si ya estás autenticado, el botón desaparecerá y se mostrará un mensaje:  
    `Conectado con Google ✅`.

-  **Formulario para crear eventos**  
  - Permite ingresar título, fecha, hora de inicio y hora de fin.  
  - Al presionar **“Crear evento”**, el evento se crea en tu **Google Calendar** y se muestra el resultado en pantalla.

-  **Sección para listar eventos**  
  - Puedes seleccionar un rango (`today`, `tomorrow`, `next_days`) y cantidad de días.  
  - Los eventos se muestran en formato JSON, con solo los campos más importantes:
    ```json
    {
      "creator": { "email": "tu@correo.com" },
      "summary": "Reunión Demo",
      "start": { "dateTime": "2025-10-18T15:00:00-05:00" },
      "end": { "dateTime": "2025-10-18T16:00:00-05:00" },
      "status": "confirmed",
      "htmlLink": "https://www.google.com/calendar/event?eid=..."
    }
    ```

####  Flujo recomendado de pruebas

1.  **Autenticarse**  
   - Haz clic en **“Iniciar sesión con Google”**.  
   - Completa el flujo de OAuth.  
   - Serás redirigido automáticamente de nuevo a `index.html` con la sesión activa.

2. **Crear un evento**  
   - Rellena el formulario.  
   - Haz clic en **“Crear evento”**.  
   - Deberías ver en pantalla la confirmación del evento y encontrarlo en tu Google Calendar.

3. **Listar eventos**  
   - Usa las opciones de rango y días.  
   - Presiona **“Listar”**.  
   - Observa los eventos resumidos directamente en la interfaz.

4. **Cerrar sesión (opcional)**  
   - Puedes eliminar el archivo `token.json` manualmente si deseas probar de nuevo el flujo de login:
     ```bash
     rm token.json
     ```
   - Luego recarga la página, y el botón de inicio de sesión volverá a aparecer.


##  Próximos pasos (siguientes fases del proyecto)
---
1. **Integrar Gemini AI (Google Generative AI)**  
   - El backend recibirá mensajes en lenguaje natural.  
   - Gemini clasificará la intención (crear evento, listar eventos, crear nota, buscar nota, etc.).  
   - El servidor ejecutará las acciones correspondientes usando las APIs de Google.

2. **Agregar Google Keep API**  
   - Crear y listar notas desde el chatbot.  
   - Integrar búsqueda de notas por contenido o título.

3. **Interfaz de usuario (frontend)**  
   - Mejorar la interfaz existente posiblemente usando un framework JS

---

##  Notas finales
---

## Contacto

Para dudas, sugerencias o colaboración puedes contactarme en:

- **Correo:** rosopenaranda@gmail.com
- **GitHub:** [rosopenaranda](https://github.com/rosopenaranda)
>  **Importante:** En esta primera versión (POC), solo se implementa la conexión y manejo de eventos de **Google Calendar**.  
>  
> El componente de interpretación de lenguaje natural mediante **Gemini** y la integración con **Google Keep** serán agregados en etapas posteriores.

---