import { useLanguage } from '../i18n';
import Modal from './Modal';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="mb-5 text-sm text-slate-400">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg bg-base-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-base-600"
        >
          {t('confirm.cancel')}
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
        >
          {confirmLabel ?? t('confirm.delete')}
        </button>
      </div>
    </Modal>
  );
}
