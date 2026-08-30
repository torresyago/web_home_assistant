# HA Things

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
  src/routes/     instances, devices, actions, auth
  src/services/   haClient.js — llamadas a la REST API de Home Assistant
  data/           db.json (se crea en tiempo de ejecución; en Docker vive en el volumen)
client/           Frontend React + Vite + Tailwind
Dockerfile        Build multi-stage: compila el frontend y lo sirve desde el backend
docker-compose.yml
```

## Notas

- La app llama a la REST API de Home Assistant (`/api/states`, `/api/services/...`); no usa el WebSocket, así que el estado se actualiza por sondeo (cada 5 s) en vez de en tiempo real instantáneo.
- Las sesiones de login usan el almacén en memoria de `express-session`: si reinicias el contenedor tendrás que volver a iniciar sesión (no afecta a las instancias/dispositivos guardados).
