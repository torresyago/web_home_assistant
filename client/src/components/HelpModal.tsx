import { useLanguage } from '../i18n';
import Modal from './Modal';
import pkg from '../../package.json';

const REPO_URL = 'https://github.com/torresyago/web_home_assistant';

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();

  return (
    <Modal title={t('help.title')} onClose={onClose}>
      <div className="flex flex-col gap-4 text-sm">
        <p className="text-slate-400">{t('help.intro')}</p>

        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section1Title')}</h3>
          <p className="text-slate-400">{t('help.section1Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section2Title')}</h3>
          <p className="text-slate-400">{t('help.section2Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section3Title')}</h3>
          <p className="text-slate-400">{t('help.section3Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section4Title')}</h3>
          <p className="text-slate-400">{t('help.section4Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section5Title')}</h3>
          <p className="text-slate-400">{t('help.section5Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section6Title')}</h3>
          <p className="text-slate-400">{t('help.section6Body')}</p>
        </div>
        <div>
          <h3 className="mb-1 font-semibold text-white">{t('help.section7Title')}</h3>
          <p className="text-slate-400">{t('help.section7Body')}</p>
        </div>

        <div className="border-t border-white/10 pt-3 text-center text-xs text-slate-500">
          <p>
            {t('help.developedBy')}{' '}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-accent-400 hover:underline"
            >
              {REPO_URL.replace('https://', '')}
            </a>
          </p>
          <p>
            {t('help.version')} {pkg.version} · {t('help.lastUpdated')} {__BUILD_DATE__}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-1 rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-base-950 transition hover:bg-accent-400"
        >
          {t('help.close')}
        </button>
      </div>
    </Modal>
  );
}
