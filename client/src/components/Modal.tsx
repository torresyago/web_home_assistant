import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-white/10 bg-base-900 shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 pb-4 pt-6">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-base-700 hover:text-slate-200">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
