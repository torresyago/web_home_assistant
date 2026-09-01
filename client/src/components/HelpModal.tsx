import { useLanguage } from '../i18n';
import Modal from './Modal';

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
