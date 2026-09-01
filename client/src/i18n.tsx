import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'ha-things-lang';

const dict = {
  es: {
    'app.loading': 'Cargando…',
    'app.accessDeniedTitle': 'Acceso restringido',
    'app.accessDeniedBody': 'El acceso por contraseña está desactivado. Necesitas un certificado de cliente autorizado para entrar.',

    'login.subtitle': 'Inicia sesión para controlar tus dispositivos',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.submitting': 'Entrando…',
    'login.submit': 'Entrar',
    'login.error': 'Error al iniciar sesión',

    'nav.security': 'Seguridad',
    'nav.help': 'Ayuda',
    'nav.addInstance': 'Home Assistant',

    'dashboard.subtitle': 'Control de tus dispositivos Home Assistant',
    'dashboard.methodPassword': 'Contraseña',
    'dashboard.emptyState': 'Añade tu primera instancia de Home Assistant para empezar',
    'dashboard.addInstance': 'Añadir Home Assistant',
    'dashboard.deleteInstanceTitle': 'Eliminar Home Assistant',
    'dashboard.deleteInstanceMessage': 'Se eliminará "{name}" y todos sus dispositivos.',
    'dashboard.deleteDeviceTitle': 'Eliminar dispositivo',
    'dashboard.deleteDeviceMessage': 'Se eliminará el dispositivo "{name}".',

    'confirm.cancel': 'Cancelar',
    'confirm.delete': 'Eliminar',

    'security.subtitle': 'Accesos al sistema y gestión de cuarentena',
    'security.resetStats': 'Reset estadísticas',
    'security.last15m': 'Últimos 15 minutos',
    'security.lastHour': 'Última hora',
    'security.allTime': 'Histórico',
    'security.valid': 'Válidos',
    'security.failed': 'Fallidos',
    'security.quarantineTitle': 'IPs en cuarentena',
    'security.ipPlaceholder': 'IP a poner en cuarentena',
    'security.minutes': 'minutos',
    'security.addQuarantine': 'Poner en cuarentena',
    'security.noQuarantine': 'No hay IPs en cuarentena',
    'security.colIp': 'IP',
    'security.colReason': 'Motivo',
    'security.colUntil': 'Hasta',
    'security.release': 'Liberar',
    'security.logTitle': 'Últimos accesos',
    'security.noLog': 'Todavía no hay accesos registrados',
    'security.colDate': 'Fecha',
    'security.colType': 'Tipo',
    'security.colMethod': 'Método',
    'security.colIdentity': 'Usuario / Certificado',
    'security.methodCertLog': 'Certificado',
    'security.methodPasswordLog': 'Contraseña',
    'security.colResult': 'Resultado',
    'security.typeLogin': 'Login',
    'security.typeWebhook': 'Webhook',
    'security.resultValid': 'Válido',
    'security.resultFailed': 'Fallido',
    'security.resetTitle': 'Resetear estadísticas',
    'security.resetMessage':
      'Se borrará el histórico de accesos y los contadores (últimos 15 min / última hora / histórico). Las IPs en cuarentena no se verán afectadas.',
    'security.resetConfirm': 'Resetear',
    'security.certSerialsTitle': 'Certificados autorizados',
    'security.certSerialsHint': 'Números de serie de certificado cliente (mTLS) con acceso a la app.',
    'security.certSerialPlaceholder': 'Número de serie (ej. 25E3273CA4B16CD668B6C489B61382C6)',
    'security.certLabelPlaceholder': 'Nombre (opcional)',
    'security.addCertSerial': 'Añadir',
    'security.noCertSerials': 'No hay certificados adicionales dados de alta',
    'security.colActive': 'Activo',
    'security.colSerial': 'Serial',
    'security.colLabel': 'Nombre',
    'security.colSource': 'Origen',
    'security.colAdded': 'Añadido',
    'security.removeCertSerial': 'Eliminar',
    'security.sourceApp': 'App',
    'security.envSerialHint': 'Definido en ALLOWED_CERT_SERIALS (.env); no se puede eliminar desde aquí, pero sí desactivar y etiquetar.',
    'security.clickToLabel': 'Añadir nombre…',
    'security.usersTitle': 'Usuarios',
    'security.usersHint': 'Usuarios adicionales con acceso por contraseña. Los de rol "Usuario" solo pueden manejar los dispositivos existentes: no pueden crear ni eliminar instancias de Home Assistant ni dispositivos, ni gestionar usuarios, certificados o IPs en cuarentena.',
    'security.usernamePlaceholder': 'Nombre de usuario',
    'security.userPasswordPlaceholder': 'Contraseña',
    'security.roleUser': 'Usuario',
    'security.roleAdmin': 'Administrador',
    'security.addUser': 'Añadir',
    'security.noUsers': 'No hay usuarios adicionales dados de alta',
    'security.colUsername': 'Usuario',
    'security.colRole': 'Rol',
    'security.colNewPassword': 'Nueva contraseña',
    'security.newPasswordPlaceholder': 'Cambiar contraseña…',
    'security.removeUser': 'Eliminar',
    'security.deleteUserTitle': 'Eliminar usuario',
    'security.deleteUserMessage': 'Se eliminará el usuario "{username}". No podrá volver a entrar con esas credenciales.',
    'security.authMethodsTitle': 'Métodos de acceso',
    'security.authMethodsHint': 'Se configuran a nivel de contenedor (variables AUTH_ALLOW_PASSWORD / AUTH_ALLOW_CERT); aquí solo se muestra el estado actual.',
    'security.methodPassword': 'Acceso con usuario y contraseña',
    'security.methodCert': 'Acceso con certificado de cliente',
    'security.methodActive': 'Activo',
    'security.methodInactive': 'Inactivo',

    'instance.edit': 'Editar Home Assistant',
    'instance.add': 'Añadir Home Assistant',
    'instance.name': 'Nombre',
    'instance.namePlaceholder': 'Casa principal',
    'instance.url': 'URL',
    'instance.token': 'Token de acceso de larga duración',
    'instance.insecure': 'Permitir certificado SSL no verificado',
    'instance.testOk': 'Conexión correcta',
    'instance.testFail': 'No se pudo conectar',
    'instance.saveError': 'Error al guardar',
    'instance.saving': 'Guardando…',
    'instance.save': 'Guardar y probar conexión',

    'device.edit': 'Editar dispositivo',
    'device.add': 'Añadir dispositivo',
    'device.kind': 'Tipo',
    'device.kindDevice': 'Dispositivo',
    'device.kindAutomation': 'Automatización',
    'device.instance': 'Home Assistant',
    'device.entity': 'Entidad',
    'device.loadingEntities': 'Cargando entidades…',
    'device.searchEntity': 'Buscar entidad…',
    'device.name': 'Nombre',
    'device.type': 'Tipo de dispositivo',
    'device.pulseDuration': 'Duración del pulso (ms)',
    'device.requiredFields': 'Completa todos los campos obligatorios',
    'device.saveError': 'Error al guardar',
    'device.saving': 'Guardando…',
    'device.save': 'Guardar dispositivo',

    'deviceType.switch': 'Interruptor',
    'deviceType.thermostat': 'Termostato',
    'deviceType.blind': 'Persiana',
    'deviceType.garage_door': 'Puerta de garaje',
    'deviceType.sensor': 'Sensor',
    'deviceType.pulse': 'Pulso',
    'deviceType.button': 'Botón',
    'deviceType.automation': 'Automatización',

    'instanceSection.addDevice': 'Dispositivo',
    'instanceSection.edit': 'Editar',
    'instanceSection.delete': 'Eliminar',
    'instanceSection.empty': 'Todavía no has añadido dispositivos para esta instancia.',

    'deviceCard.edit': 'Editar',
    'deviceCard.endpoint': 'Endpoint',
    'deviceCard.delete': 'Eliminar',

    'card.noData': 'Sin datos',
    'card.online': 'En línea',
    'card.offline': 'No disponible en Home Assistant',
    'card.lastSeenAt': 'Visto por última vez: {time}',
    'card.neverSeen': 'Sin datos de conexión previos',
    'card.on': 'Encendido',
    'card.off': 'Apagado',
    'card.current': 'Actual',
    'card.position': 'Posición',
    'card.open': 'Abierta',
    'card.closed': 'Cerrada',
    'card.openAction': 'Abrir',
    'card.closeAction': 'Cerrar',
    'card.activating': 'Activando…',
    'card.openClose': 'Abrir / Cerrar',
    'card.activate': 'Activar',
    'card.press': 'Pulsar',
    'card.runAutomation': 'Ejecutar automatización',
    'card.running': 'Ejecutando…',

    'endpoint.title': 'Endpoint para Atajos',
    'endpoint.session': 'Sesión',
    'endpoint.webhook': 'Webhook',
    'endpoint.noteCloseCover': 'Usa "close_cover" para cerrar.',
    'endpoint.noteBlind':
      'Otras acciones: "close_cover", "stop_cover", o "set_cover_position" con params.position (0-100).',
    'endpoint.noteThermostat': 'Otra acción: "set_hvac_mode" con params.hvac_mode.',
    'endpoint.noteSensor': 'Los sensores son de solo lectura, no aceptan acciones.',
    'endpoint.noteAutomation': 'Ejecuta la automatización saltándose sus condiciones (equivalente a "Ejecutar" en Home Assistant).',
    'endpoint.noKey': 'No hay WEBHOOK_API_KEY configurada en el servidor. Añádela en el .env y reinicia el contenedor.',
    'endpoint.urlLabel': 'URL (POST)',
    'endpoint.headerLabel': 'Cabecera',
    'endpoint.bodyLabel': 'Cuerpo JSON',
    'endpoint.curlLabel': 'Prueba con curl',
    'endpoint.sessionHelp':
      'Requiere sesión iniciada (login o certificado de cliente en el navegador/cliente). No funciona desde Atajos de iOS, que no presenta certificados.',
    'endpoint.webhookHelp':
      'En Atajos de iOS: acción "Obtener contenido de URL" → Método POST → Headers: Content-Type: application/json y X-Api-Key con la clave de arriba → Request Body JSON con el cuerpo de arriba.',

    'help.title': 'Ayuda',
    'help.intro':
      'HA Things te deja controlar dispositivos de Home Assistant desde un panel web sencillo, con soporte para automatizaciones externas (p.ej. Atajos de iOS).',
    'help.section1Title': '1. Añade tu Home Assistant',
    'help.section1Body':
      'Pulsa "Home Assistant" e introduce la URL de tu instancia y un token de acceso de larga duración (lo generas en tu perfil de Home Assistant, al final de la página).',
    'help.section2Title': '2. Añade dispositivos',
    'help.section2Body':
      'Dentro de cada instancia, pulsa "Dispositivo", busca la entidad y elige el tipo (interruptor, termostato, persiana, puerta de garaje, sensor, pulso o botón).',
    'help.section3Title': '3. Endpoints para automatizar',
    'help.section3Body':
      'En el menú de cada dispositivo, "Endpoint" te da la URL y el cuerpo JSON para accionarlo por sesión (navegador) o por webhook con API key (Atajos de iOS u otras automatizaciones).',
    'help.section4Title': '4. Panel de seguridad',
    'help.section4Body':
      'El botón "Seguridad" muestra accesos válidos/fallidos (últimos 15 min, última hora, histórico), permite resetear las estadísticas y gestionar manualmente qué IPs están en cuarentena.',
    'help.section5Title': '5. Certificados de cliente autorizados',
    'help.section5Body':
      'Hay dos formas de autorizar un certificado: (1) en el .env del servidor, variable ALLOWED_CERT_SERIALS con los seriales separados por comas (requiere reiniciar el contenedor tras editarla) — estos aparecen en el panel de Seguridad marcados como ".env"; (2) desde el propio panel de Seguridad, sección "Certificados autorizados": pega el serial y opcionalmente un nombre y pulsa "Añadir" — se aplica al instante, sin reiniciar nada. Para cualquiera de los dos, sea de .env o de la app, puedes ponerle un nombre (haz clic en el campo y escribe) y activarlo/desactivarlo con el interruptor sin necesidad de eliminarlo — un certificado desactivado deja de dar acceso al instante. Solo los añadidos desde la app se pueden eliminar por completo con el botón de la papelera; los de .env requieren editar el .env y reiniciar para quitarlos del todo. Cuando entras con un certificado, verás un indicador con un punto verde parpadeante junto a tu nombre (o el serial) en la cabecera de la app, mostrando qué certificado está autenticando tu sesión actual. El certificado también debe estar aceptado en la configuración de nginx/proxy inverso (mTLS) para llegar a la app; ver el README del proyecto para el ejemplo de configuración.',
    'help.section6Title': '6. Métodos de acceso permitidos',
    'help.section6Body':
      'La sección "Métodos de acceso" del panel de Seguridad muestra si el login por contraseña y el acceso por certificado están activos o inactivos. Es solo informativo: se controla a nivel de contenedor con las variables de entorno AUTH_ALLOW_PASSWORD y AUTH_ALLOW_CERT (ambas activas por defecto) — para cambiarlo hay que editar el .env y reiniciar el contenedor, no se puede desde la web. Si desactivas el acceso por contraseña, la app deja de mostrar el formulario de login y solo entra quien tenga un certificado autorizado; debe quedar al menos un método activo.',
    'help.section7Title': '7. Usuarios y roles',
    'help.section7Body':
      'Desde la sección "Usuarios" del panel de Seguridad, un administrador puede crear usuarios adicionales con contraseña propia y asignarles rol "Administrador" o "Usuario". Los de rol Usuario solo pueden ver y manejar los dispositivos existentes (encender, apagar, ajustar, etc.); no pueden crear ni eliminar instancias de Home Assistant ni dispositivos, ni entrar al panel de Seguridad (ni por tanto gestionar otros usuarios, certificados o IPs en cuarentena). El rol se puede cambiar y la contraseña resetear en cualquier momento desde esa misma tabla. El usuario/contraseña definidos en ADMIN_USER/ADMIN_PASSWORD del .env siempre tienen rol Administrador y no aparecen en esta lista.',
    'help.close': 'Cerrar',
    'help.developedBy': 'Desarrollado por Yago Torres ·',
    'help.version': 'Versión',
    'help.lastUpdated': '· Actualizado el',
  },
  en: {
    'app.loading': 'Loading…',
    'app.accessDeniedTitle': 'Access restricted',
    'app.accessDeniedBody': 'Password login is disabled. You need an authorized client certificate to get in.',

    'login.subtitle': 'Sign in to control your devices',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.submitting': 'Signing in…',
    'login.submit': 'Sign in',
    'login.error': 'Error signing in',

    'nav.security': 'Security',
    'nav.help': 'Help',
    'nav.addInstance': 'Home Assistant',

    'dashboard.subtitle': 'Control your Home Assistant devices',
    'dashboard.methodPassword': 'Password',
    'dashboard.emptyState': 'Add your first Home Assistant instance to get started',
    'dashboard.addInstance': 'Add Home Assistant',
    'dashboard.deleteInstanceTitle': 'Delete Home Assistant',
    'dashboard.deleteInstanceMessage': '"{name}" and all its devices will be deleted.',
    'dashboard.deleteDeviceTitle': 'Delete device',
    'dashboard.deleteDeviceMessage': 'Device "{name}" will be deleted.',

    'confirm.cancel': 'Cancel',
    'confirm.delete': 'Delete',

    'security.subtitle': 'System access and quarantine management',
    'security.resetStats': 'Reset stats',
    'security.last15m': 'Last 15 minutes',
    'security.lastHour': 'Last hour',
    'security.allTime': 'All time',
    'security.valid': 'Valid',
    'security.failed': 'Failed',
    'security.quarantineTitle': 'Quarantined IPs',
    'security.ipPlaceholder': 'IP to quarantine',
    'security.minutes': 'minutes',
    'security.addQuarantine': 'Quarantine',
    'security.noQuarantine': 'No IPs are currently quarantined',
    'security.colIp': 'IP',
    'security.colReason': 'Reason',
    'security.colUntil': 'Until',
    'security.release': 'Release',
    'security.logTitle': 'Recent access attempts',
    'security.noLog': 'No access attempts recorded yet',
    'security.colDate': 'Date',
    'security.colType': 'Type',
    'security.colMethod': 'Method',
    'security.colIdentity': 'Username / Certificate',
    'security.methodCertLog': 'Certificate',
    'security.methodPasswordLog': 'Password',
    'security.colResult': 'Result',
    'security.typeLogin': 'Login',
    'security.typeWebhook': 'Webhook',
    'security.resultValid': 'Valid',
    'security.resultFailed': 'Failed',
    'security.resetTitle': 'Reset stats',
    'security.resetMessage':
      'This will clear the access history and counters (last 15 min / last hour / all time). Quarantined IPs will not be affected.',
    'security.resetConfirm': 'Reset',
    'security.certSerialsTitle': 'Authorized certificates',
    'security.certSerialsHint': 'Client certificate (mTLS) serial numbers allowed to access the app.',
    'security.certSerialPlaceholder': 'Serial number (e.g. 25E3273CA4B16CD668B6C489B61382C6)',
    'security.certLabelPlaceholder': 'Label (optional)',
    'security.addCertSerial': 'Add',
    'security.noCertSerials': 'No additional certificates registered',
    'security.colActive': 'Active',
    'security.colSerial': 'Serial',
    'security.colLabel': 'Label',
    'security.colSource': 'Source',
    'security.colAdded': 'Added',
    'security.removeCertSerial': 'Remove',
    'security.sourceApp': 'App',
    'security.envSerialHint': 'Defined in ALLOWED_CERT_SERIALS (.env); it can\'t be removed from here, but can be disabled and labeled.',
    'security.clickToLabel': 'Add a label…',
    'security.usersTitle': 'Users',
    'security.usersHint': 'Additional users with password access. "User" role can only operate existing devices: they can\'t create or delete Home Assistant instances or devices, nor manage users, certificates, or quarantined IPs.',
    'security.usernamePlaceholder': 'Username',
    'security.userPasswordPlaceholder': 'Password',
    'security.roleUser': 'User',
    'security.roleAdmin': 'Admin',
    'security.addUser': 'Add',
    'security.noUsers': 'No additional users registered',
    'security.colUsername': 'Username',
    'security.colRole': 'Role',
    'security.colNewPassword': 'New password',
    'security.newPasswordPlaceholder': 'Change password…',
    'security.removeUser': 'Remove',
    'security.deleteUserTitle': 'Delete user',
    'security.deleteUserMessage': 'This will delete the user "{username}". They will no longer be able to log in with those credentials.',
    'security.authMethodsTitle': 'Access methods',
    'security.authMethodsHint': 'Configured at the container level (AUTH_ALLOW_PASSWORD / AUTH_ALLOW_CERT env vars); this only shows the current status.',
    'security.methodPassword': 'Username/password access',
    'security.methodCert': 'Client certificate access',
    'security.methodActive': 'Active',
    'security.methodInactive': 'Inactive',

    'instance.edit': 'Edit Home Assistant',
    'instance.add': 'Add Home Assistant',
    'instance.name': 'Name',
    'instance.namePlaceholder': 'Main house',
    'instance.url': 'URL',
    'instance.token': 'Long-lived access token',
    'instance.insecure': 'Allow unverified SSL certificate',
    'instance.testOk': 'Connection successful',
    'instance.testFail': 'Could not connect',
    'instance.saveError': 'Error saving',
    'instance.saving': 'Saving…',
    'instance.save': 'Save and test connection',

    'device.edit': 'Edit device',
    'device.add': 'Add device',
    'device.kind': 'Type',
    'device.kindDevice': 'Device',
    'device.kindAutomation': 'Automation',
    'device.instance': 'Home Assistant',
    'device.entity': 'Entity',
    'device.loadingEntities': 'Loading entities…',
    'device.searchEntity': 'Search entity…',
    'device.name': 'Name',
    'device.type': 'Device type',
    'device.pulseDuration': 'Pulse duration (ms)',
    'device.requiredFields': 'Fill in all required fields',
    'device.saveError': 'Error saving',
    'device.saving': 'Saving…',
    'device.save': 'Save device',

    'deviceType.switch': 'Switch',
    'deviceType.thermostat': 'Thermostat',
    'deviceType.blind': 'Blind',
    'deviceType.garage_door': 'Garage door',
    'deviceType.sensor': 'Sensor',
    'deviceType.pulse': 'Pulse',
    'deviceType.button': 'Button',
    'deviceType.automation': 'Automation',

    'instanceSection.addDevice': 'Device',
    'instanceSection.edit': 'Edit',
    'instanceSection.delete': 'Delete',
    'instanceSection.empty': "You haven't added any devices to this instance yet.",

    'deviceCard.edit': 'Edit',
    'deviceCard.endpoint': 'Endpoint',
    'deviceCard.delete': 'Delete',

    'card.noData': 'No data',
    'card.online': 'Online',
    'card.offline': 'Unavailable in Home Assistant',
    'card.lastSeenAt': 'Last seen: {time}',
    'card.neverSeen': 'No previous connection data',
    'card.on': 'On',
    'card.off': 'Off',
    'card.current': 'Current',
    'card.position': 'Position',
    'card.open': 'Open',
    'card.closed': 'Closed',
    'card.openAction': 'Open',
    'card.closeAction': 'Close',
    'card.activating': 'Activating…',
    'card.openClose': 'Open / Close',
    'card.activate': 'Activate',
    'card.press': 'Press',
    'card.runAutomation': 'Run automation',
    'card.running': 'Running…',

    'endpoint.title': 'Endpoint for Shortcuts',
    'endpoint.session': 'Session',
    'endpoint.webhook': 'Webhook',
    'endpoint.noteCloseCover': 'Use "close_cover" to close it.',
    'endpoint.noteBlind':
      'Other actions: "close_cover", "stop_cover", or "set_cover_position" with params.position (0-100).',
    'endpoint.noteThermostat': 'Other action: "set_hvac_mode" with params.hvac_mode.',
    'endpoint.noteSensor': 'Sensors are read-only, they do not accept actions.',
    'endpoint.noteAutomation': 'Runs the automation, skipping its conditions (equivalent to "Run" in Home Assistant).',
    'endpoint.noKey': 'No WEBHOOK_API_KEY is configured on the server. Add it to the .env and restart the container.',
    'endpoint.urlLabel': 'URL (POST)',
    'endpoint.headerLabel': 'Header',
    'endpoint.bodyLabel': 'JSON body',
    'endpoint.curlLabel': 'Test with curl',
    'endpoint.sessionHelp':
      "Requires a logged-in session (login or client certificate in the browser/client). Doesn't work from iOS Shortcuts, which can't present certificates.",
    'endpoint.webhookHelp':
      'In iOS Shortcuts: "Get Contents of URL" action → Method POST → Headers: Content-Type: application/json and X-Api-Key with the key above → Request Body JSON with the body above.',

    'help.title': 'Help',
    'help.intro':
      'HA Things lets you control Home Assistant devices from a simple web panel, with support for external automations (e.g. iOS Shortcuts).',
    'help.section1Title': '1. Add your Home Assistant',
    'help.section1Body':
      'Click "Home Assistant" and enter your instance URL and a long-lived access token (generate it from your Home Assistant profile page, at the bottom).',
    'help.section2Title': '2. Add devices',
    'help.section2Body':
      'Inside each instance, click "Device", search for the entity and pick its type (switch, thermostat, blind, garage door, sensor, pulse or button).',
    'help.section3Title': '3. Endpoints for automation',
    'help.section3Body':
      'In each device\'s menu, "Endpoint" gives you the URL and JSON body to trigger it via session (browser) or via a webhook with an API key (iOS Shortcuts or other automations).',
    'help.section4Title': '4. Security panel',
    'help.section4Body':
      'The "Security" button shows valid/failed access attempts (last 15 min, last hour, all time), lets you reset the stats, and manually manage which IPs are quarantined.',
    'help.section5Title': '5. Authorized client certificates',
    'help.section5Body':
      'There are two ways to authorize a certificate: (1) in the server\'s .env, the ALLOWED_CERT_SERIALS variable with serials separated by commas (requires restarting the container after editing) — these show up in the Security panel marked as ".env"; (2) from the Security panel itself, "Authorized certificates" section: paste the serial and optionally a label, then click "Add" — it applies instantly, no restart needed. Either way, whether it came from .env or the app, you can give it a label (click the field and type) and toggle it on/off with the switch without deleting it — a disabled certificate stops granting access instantly. Only app-added ones can be fully deleted with the trash button; .env ones require editing .env and restarting to remove them entirely. When you sign in with a certificate, you\'ll see an indicator with a blinking green dot next to your name (or serial) in the app header, showing which certificate is authenticating your current session. The certificate also needs to be accepted in the nginx/reverse-proxy config (mTLS) to reach the app; see the project README for a config example.',
    'help.section6Title': '6. Allowed access methods',
    'help.section6Body':
      'The "Access methods" section of the Security panel shows whether password login and certificate access are active or inactive. It\'s informational only: it\'s controlled at the container level with the AUTH_ALLOW_PASSWORD and AUTH_ALLOW_CERT environment variables (both enabled by default) — changing it requires editing .env and restarting the container, not something you can do from the web. If you disable password login, the app stops showing the login form and only lets in someone with an authorized certificate; at least one method must stay enabled.',
    'help.section7Title': '7. Users and roles',
    'help.section7Body':
      'From the "Users" section of the Security panel, an admin can create additional users with their own password and assign them the "Admin" or "User" role. Users with the User role can only view and operate existing devices (turn on/off, adjust, etc.); they can\'t create or delete Home Assistant instances or devices, and can\'t reach the Security panel at all (so they also can\'t manage other users, certificates, or quarantined IPs). The role can be changed and the password reset at any time from that same table. The username/password set in ADMIN_USER/ADMIN_PASSWORD in .env always has the Admin role and doesn\'t show up in this list.',
    'help.close': 'Close',
    'help.developedBy': 'Developed by Yago Torres ·',
    'help.version': 'Version',
    'help.lastUpdated': '· Updated on',
  },
} as const;

export type TranslationKey = keyof (typeof dict)['es'];

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') return stored;
  } catch {
    // localStorage no disponible, seguimos con el idioma del navegador
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignorar si no hay localStorage
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key, vars) => {
        let text: string = dict[lang][key] ?? dict.es[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            text = text.replace(`{${k}}`, v);
          }
        }
        return text;
      },
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return ctx;
}
