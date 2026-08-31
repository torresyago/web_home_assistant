import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'ha-things-lang';

const dict = {
  es: {
    'app.loading': 'Cargando…',

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
    'security.colResult': 'Resultado',
    'security.typeLogin': 'Login',
    'security.typeWebhook': 'Webhook',
    'security.resultValid': 'Válido',
    'security.resultFailed': 'Fallido',
    'security.resetTitle': 'Resetear estadísticas',
    'security.resetMessage':
      'Se borrará el histórico de accesos y los contadores (últimos 15 min / última hora / histórico). Las IPs en cuarentena no se verán afectadas.',
    'security.resetConfirm': 'Resetear',

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

    'instanceSection.addDevice': 'Dispositivo',
    'instanceSection.edit': 'Editar',
    'instanceSection.delete': 'Eliminar',
    'instanceSection.empty': 'Todavía no has añadido dispositivos para esta instancia.',

    'deviceCard.edit': 'Editar',
    'deviceCard.endpoint': 'Endpoint',
    'deviceCard.delete': 'Eliminar',

    'card.noData': 'Sin datos',
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

    'endpoint.title': 'Endpoint para Atajos',
    'endpoint.session': 'Sesión',
    'endpoint.webhook': 'Webhook',
    'endpoint.noteCloseCover': 'Usa "close_cover" para cerrar.',
    'endpoint.noteBlind':
      'Otras acciones: "close_cover", "stop_cover", o "set_cover_position" con params.position (0-100).',
    'endpoint.noteThermostat': 'Otra acción: "set_hvac_mode" con params.hvac_mode.',
    'endpoint.noteSensor': 'Los sensores son de solo lectura, no aceptan acciones.',
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
    'help.close': 'Cerrar',
  },
  en: {
    'app.loading': 'Loading…',

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
    'security.colResult': 'Result',
    'security.typeLogin': 'Login',
    'security.typeWebhook': 'Webhook',
    'security.resultValid': 'Valid',
    'security.resultFailed': 'Failed',
    'security.resetTitle': 'Reset stats',
    'security.resetMessage':
      'This will clear the access history and counters (last 15 min / last hour / all time). Quarantined IPs will not be affected.',
    'security.resetConfirm': 'Reset',

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

    'instanceSection.addDevice': 'Device',
    'instanceSection.edit': 'Edit',
    'instanceSection.delete': 'Delete',
    'instanceSection.empty': "You haven't added any devices to this instance yet.",

    'deviceCard.edit': 'Edit',
    'deviceCard.endpoint': 'Endpoint',
    'deviceCard.delete': 'Delete',

    'card.noData': 'No data',
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

    'endpoint.title': 'Endpoint for Shortcuts',
    'endpoint.session': 'Session',
    'endpoint.webhook': 'Webhook',
    'endpoint.noteCloseCover': 'Use "close_cover" to close it.',
    'endpoint.noteBlind':
      'Other actions: "close_cover", "stop_cover", or "set_cover_position" with params.position (0-100).',
    'endpoint.noteThermostat': 'Other action: "set_hvac_mode" with params.hvac_mode.',
    'endpoint.noteSensor': 'Sensors are read-only, they do not accept actions.',
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
    'help.close': 'Close',
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
