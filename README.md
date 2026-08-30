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

## Seguridad

La app está pensada para exponerse detrás de un reverse proxy (nginx, NPM, etc.) que termine TLS. Las medidas de seguridad previstas son:

- **Certificado de cliente (mTLS)**: el proxy puede exigir un certificado de cliente (ej. FNMT) y pasar el número de serie en la cabecera `X-SSL-Client-Serial` (y opcionalmente `X-SSL-Client-Verify`). La app valida esa cabecera y, si `ALLOWED_CERT_SERIALS` tiene valores, comprueba además que el serial esté en la lista blanca — doble capa (proxy + app) por si el proxy cambia de configuración.
- **Login usuario/contraseña** (`ADMIN_USER`/`ADMIN_PASSWORD`) como alternativa o complemento al certificado, para acceder también desde clientes que no puedan presentar uno.
- **Webhook con API key propia** (`WEBHOOK_API_KEY`): la ruta `/api/webhook/:deviceId` está pensada para integraciones externas (Atajos de iOS, automatizaciones) que no pueden hacer mTLS. Se autentica solo con una cabecera `X-Api-Key`, comparada con [`crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b) para evitar ataques de temporización.
- **Cuarentena por fuerza bruta**: si una IP falla la API key del webhook 5 veces en 5 minutos, queda bloqueada 15 minutos (`429 Too Many Requests`), independientemente de si luego usa la key correcta. Ver [`server/src/middleware/quarantine.js`](server/src/middleware/quarantine.js).
- **Rate limiting a nivel de proxy**: se recomienda añadir un `limit_req` en nginx sobre la ruta del webhook (ver ejemplo más abajo) como capa adicional contra flood/DDoS, independiente de la lógica de la app.
- **Separación de dominios recomendada**: si usas certificado de cliente, sirve el panel web y el webhook en subdominios distintos — uno exigiendo mTLS estricto (`ssl_verify_client on`) y otro sin exigirlo, dedicado solo a `/api/webhook/*` con la API key. Mezclar `ssl_verify_client optional` con certificado opcional en el mismo host puede ser inestable con TLS 1.3 en algunas versiones de nginx.

Ejemplo de bloque nginx para limitar la tasa de peticiones al webhook (a nivel `http`, fuera del `server`):

```nginx
limit_req_zone $binary_remote_addr zone=webhook_zone:10m rate=20r/m;
```

Y en el `server`/`location` del subdominio del webhook:

```nginx
location /api/webhook/ {
    limit_req zone=webhook_zone burst=5 nodelay;
    proxy_pass http://ha-things:3000;
}
```

## Uso con Atajos de iOS

El endpoint de webhook permite disparar acciones (encender, apagar, pulsar, abrir/cerrar persiana, etc.) desde la app Atajos de iOS sin necesidad de certificado de cliente:

1. En el panel web, abre el menú de un dispositivo (⋮) → **"Endpoint"** → pestaña **"Webhook"**. Ahí verás la URL exacta, la cabecera `X-Api-Key` ya rellenada y el cuerpo JSON correcto para ese tipo de dispositivo.
2. En la app Atajos, crea un atajo nuevo con la acción **"Obtener contenido de URL"**:
   - **URL**: la mostrada en el panel (`https://tu-dominio-webhook/api/webhook/<deviceId>`).
   - **Método**: `POST`.
   - **Headers**: `Content-Type: application/json` y `X-Api-Key: <tu clave>`.
   - **Request Body**: `JSON`, con el cuerpo mostrado en el panel (p. ej. `{"action":"toggle"}`).
3. Guarda el atajo. Puedes añadirlo a la pantalla de inicio, ejecutarlo por voz con Siri, o incluirlo en una automatización (llegada a casa, hora del día, etc.).

Notas:
- La acción "Obtener contenido de URL" de Atajos **no presenta certificados de cliente** (a diferencia de Safari), por eso el webhook usa API key en vez de mTLS.
- Si tras varios intentos con una key incorrecta el atajo empieza a fallar con `429`, tu IP está en cuarentena temporal (ver sección de Seguridad); espera 15 minutos o corrige la key.

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

### Security

The app is meant to be exposed behind a reverse proxy (nginx, NPM, etc.) that terminates TLS. The security measures in place are:

- **Client certificate (mTLS)**: the proxy can require a client certificate (e.g. FNMT/similar) and forward its serial number in the `X-SSL-Client-Serial` header (and optionally `X-SSL-Client-Verify`). The app validates that header and, when `ALLOWED_CERT_SERIALS` is set, additionally checks that the serial is in the allow-list — a double layer (proxy + app) in case the proxy's config changes.
- **Username/password login** (`ADMIN_USER`/`ADMIN_PASSWORD`) as an alternative or complement to the certificate, so clients that can't present one can still get in.
- **Webhook with its own API key** (`WEBHOOK_API_KEY`): the `/api/webhook/:deviceId` route is meant for external integrations (iOS Shortcuts, automations) that can't do mTLS. It's authenticated purely with an `X-Api-Key` header, compared using [`crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b) to avoid timing attacks.
- **Brute-force quarantine**: if an IP fails the webhook API key 5 times within 5 minutes, it gets blocked for 15 minutes (`429 Too Many Requests`), regardless of whether it later uses the correct key. See [`server/src/middleware/quarantine.js`](server/src/middleware/quarantine.js).
- **Proxy-level rate limiting**: it's recommended to add an nginx `limit_req` on the webhook route (see example below) as an extra layer against flood/DDoS traffic, independent of the app's own logic.
- **Recommended domain separation**: if you use a client certificate, serve the web panel and the webhook on separate subdomains — one strictly requiring mTLS (`ssl_verify_client on`) and another without it, dedicated only to `/api/webhook/*` with the API key. Mixing `ssl_verify_client optional` with an optional certificate on the same host can be unstable with TLS 1.3 on some nginx versions.

Example nginx block to rate-limit requests to the webhook (at the `http` level, outside `server`):

```nginx
limit_req_zone $binary_remote_addr zone=webhook_zone:10m rate=20r/m;
```

And in the webhook subdomain's `server`/`location`:

```nginx
location /api/webhook/ {
    limit_req zone=webhook_zone burst=5 nodelay;
    proxy_pass http://ha-things:3000;
}
```

### Using it with iOS Shortcuts

The webhook endpoint lets you trigger actions (turn on/off, press, open/close a blind, etc.) from the iOS Shortcuts app without needing a client certificate:

1. In the web panel, open a device's menu (⋮) → **"Endpoint"** → **"Webhook"** tab. You'll see the exact URL, the `X-Api-Key` header already filled in, and the correct JSON body for that device type.
2. In the Shortcuts app, create a new shortcut with the **"Get Contents of URL"** action:
   - **URL**: the one shown in the panel (`https://your-webhook-domain/api/webhook/<deviceId>`).
   - **Method**: `POST`.
   - **Headers**: `Content-Type: application/json` and `X-Api-Key: <your key>`.
   - **Request Body**: `JSON`, with the body shown in the panel (e.g. `{"action":"toggle"}`).
3. Save the shortcut. You can add it to your home screen, run it by voice with Siri, or include it in an automation (arriving home, time of day, etc.).

Notes:
- Shortcuts' "Get Contents of URL" action **does not present client certificates** (unlike Safari), which is why the webhook uses an API key instead of mTLS.
- If the shortcut starts failing with `429` after a few attempts with a wrong key, your IP is temporarily quarantined (see the Security section); wait 15 minutes or fix the key.

### Notes

- The app calls the Home Assistant REST API (`/api/states`, `/api/services/...`); it does not use the WebSocket, so state is updated via polling (every 5 s) rather than instantly in real time.
- Login sessions use `express-session`'s in-memory store: restarting the container requires logging in again (this does not affect saved instances/devices).
