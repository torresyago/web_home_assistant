import { useLanguage } from '../i18n';

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5 text-xs">
      <button
        onClick={() => setLang('es')}
        className={`rounded-md px-2 py-1.5 font-semibold transition ${
          lang === 'es' ? 'bg-base-700 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLang('en')}
        className={`rounded-md px-2 py-1.5 font-semibold transition ${
          lang === 'en' ? 'bg-base-700 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
