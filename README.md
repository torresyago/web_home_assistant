# HA Things

*[Read this in English](#english) ↓*

Aplicación web para controlar dispositivos de una o varias instancias de Home Assistant desde un panel visual, pensada para ejecutarse en Docker. El modelo de "cosas" (things) sigue la misma idea que [homebridge-homeassistant-things](https://github.com/torresyago/homebridge-homeassistant-things): defines dispositivos apuntando a una entidad de Home Assistant y un tipo de control.

## Características

- Añade una o varias instancias de Home Assistant (nombre, URL y token de acceso de larga duración).
- Explora y busca las entidades de cada instancia al añadir un dispositivo, sin escribir el `entity_id` a mano.
- Tipos de dispositivo soportados, cada uno con su propio control:
  - **Interruptor** (switch/light/input_boolean): toggle on/off.
  - **Termostato** (climate): temperatura actual y objetivo con +/-.
  - **Persiana** (cover): posición 0-100% y botones abrir/parar/cerrar.
  - **Puerta de garaje**: si es `cover`, abrir/cerrar; si es un `switch` de relé, pulso automático.
  - **Sensor**: lectura de solo lectura con su unidad.
  - **Pulso**: interruptor momentáneo que se apaga solo tras `pulseDuration` ms.
  - **Botón**: dispara `button.press` o `script.turn_on`.
- Estado en vivo por sondeo cada 5 segundos.
- Login opcional de un único usuario/contraseña para proteger el panel.
- Endpoint webhook (`/api/webhook/:deviceId`) protegido con API key, pensado para integraciones externas (p. ej. Atajos de iOS) que no pueden presentar certificado de cliente.

## Puesta en marcha con Docker (recomendado)

1. Copia el archivo de entorno de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. (Opcional) Edita `.env` para activar el login del panel y/o cambiar el secreto de sesión:

   ```
   ADMIN_USER=admin
   ADMIN_PASSWORD=una-contraseña-fuerte
   ```

   Si dejas `ADMIN_USER`/`ADMIN_PASSWORD` vacíos, la app no pedirá login (pensado para uso en red local de confianza).

3. Levanta el contenedor:

   ```bash
   docker compose up -d --build
   ```

### Usando la imagen ya publicada (sin clonar el código)

Cada push a `main` publica automáticamente la imagen en GitHub Container Registry. Puedes desplegarla directamente sin compilar nada:

```bash
curl -O https://raw.githubusercontent.com/torresyago/web_home_assistant/main/docker-compose.ghcr.yml
curl -O https://raw.githubusercontent.com/torresyago/web_home_assistant/main/.env.example
cp .env.example .env   # y edítalo
docker compose -f docker-compose.ghcr.yml up -d
```

4. Abre [http://localhost:3000](http://localhost:3000).

Los datos (instancias y dispositivos configurados) se guardan en el volumen `ha-things-data`, persistente entre reinicios.

## Obtener el token de Home Assistant

En Home Assistant: perfil de usuario (icono inferior izquierdo) → pestaña "Seguridad" → "Tokens de acceso de larga duración" → "Crear token". Pega ese token al añadir la instancia en la app.

Si tu Home Assistant usa un certificado SSL autofirmado, marca la casilla "Permitir certificado SSL no verificado" al configurar la instancia.

## Desarrollo local (sin Docker)

Necesitas Node.js 20+.

```bash
# Backend
cd server
npm install
npm run dev        # http://localhost:3000 (API)

# Frontend (en otra terminal)
cd client
npm install
npm run dev         # http://localhost:5173, con proxy de /api al backend
```

Para generar el build de producción del frontend dentro de `server/public` (lo que sirve el backend):

```bash
cd client
npm run build
```

## Estructura del proyecto

```
server/           API Express + almacenamiento en JSON + cliente HTTP de Home Assistant
  src/routes/     instances, devices, actions, auth, webhook
  src/services/   haClient.js — llamadas a la REST API de Home Assistant
  data/           db.json (se crea en tiempo de ejecución; en Docker vive en el volumen)
client/           Frontend React + Vite + Tailwind
Dockerfile        Build multi-stage: compila el frontend y lo sirve desde el backend
docker-compose.yml
```

## Notas

- La app llama a la REST API de Home Assistant (`/api/states`, `/api/services/...`); no usa el WebSocket, así que el estado se actualiza por sondeo (cada 5 s) en vez de en tiempo real instantáneo.
- Las sesiones de login usan el almacén en memoria de `express-session`: si reinicias el contenedor tendrás que volver a iniciar sesión (no afecta a las instancias/dispositivos guardados).

---

## English

*[Leer esto en español](#ha-things) ↑*

Web app to control devices from one or more Home Assistant instances through a visual panel, built to run in Docker. The "things" model follows the same idea as [homebridge-homeassistant-things](https://github.com/torresyago/homebridge-homeassistant-things): a device points to a Home Assistant entity plus a control type.

### Features

- Add one or more Home Assistant instances (name, URL, and long-lived access token).
- Browse and search each instance's entities when adding a device, no need to type the `entity_id` by hand.
- Supported device types, each with its own control:
  - **Switch** (switch/light/input_boolean): on/off toggle.
  - **Thermostat** (climate): current and target temperature with +/-.
  - **Blind** (cover): 0-100% position plus open/stop/close buttons.
  - **Garage door**: if it's a `cover`, open/close; if it's a relay `switch`, an automatic pulse.
  - **Sensor**: read-only reading with its unit.
  - **Pulse**: momentary switch that turns itself off after `pulseDuration` ms.
  - **Button**: triggers `button.press` or `script.turn_on`.
- Live state via polling every 5 seconds.
- Optional single username/password login to protect the panel.
- Webhook endpoint (`/api/webhook/:deviceId`) protected with an API key, for external integrations (e.g. iOS Shortcuts) that cannot present a client certificate.

### Getting started with Docker (recommended)

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. (Optional) Edit `.env` to enable panel login and/or change the session secret:

   ```
   ADMIN_USER=admin
   ADMIN_PASSWORD=a-strong-password
   ```

   If you leave `ADMIN_USER`/`ADMIN_PASSWORD` empty, the app won't ask for login (intended for use on a trusted local network).

3. Start the container:

   ```bash
   docker compose up -d --build
   ```

#### Using the published image (without cloning the code)

Every push to `main` automatically publishes the image to the GitHub Container Registry. You can deploy it directly without building anything:

```bash
curl -O https://raw.githubusercontent.com/torresyago/web_home_assistant/main/docker-compose.ghcr.yml
curl -O https://raw.githubusercontent.com/torresyago/web_home_assistant/main/.env.example
cp .env.example .env   # then edit it
docker compose -f docker-compose.ghcr.yml up -d
```

4. Open [http://localhost:3000](http://localhost:3000).

Data (configured instances and devices) is stored in the `ha-things-data` volume, persistent across restarts.

### Getting a Home Assistant token

In Home Assistant: user profile (bottom-left icon) → "Security" tab → "Long-lived access tokens" → "Create token". Paste that token when adding the instance in the app.

If your Home Assistant uses a self-signed SSL certificate, check "Allow unverified SSL certificate" when configuring the instance.

### Local development (without Docker)

You need Node.js 20+.

```bash
# Backend
cd server
npm install
npm run dev        # http://localhost:3000 (API)

# Frontend (in another terminal)
cd client
npm install
npm run dev         # http://localhost:5173, proxies /api to the backend
```

To generate the frontend's production build inside `server/public` (what the backend serves):

```bash
cd client
npm run build
```

### Project structure

```
server/           Express API + JSON storage + Home Assistant HTTP client
  src/routes/     instances, devices, actions, auth, webhook
  src/services/   haClient.js — calls to the Home Assistant REST API
  data/           db.json (created at runtime; lives in the volume under Docker)
client/           React + Vite + Tailwind frontend
Dockerfile        Multi-stage build: builds the frontend and serves it from the backend
docker-compose.yml
```

### Notes

- The app calls the Home Assistant REST API (`/api/states`, `/api/services/...`); it does not use the WebSocket, so state is updated via polling (every 5 s) rather than instantly in real time.
- Login sessions use `express-session`'s in-memory store: restarting the container requires logging in again (this does not affect saved instances/devices).
