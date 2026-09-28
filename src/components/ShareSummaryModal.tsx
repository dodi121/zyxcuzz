import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send } from 'lucide-react';
import { RecapMetrics } from '../types/recap';
import { generateWhatsAppRecapText } from '../utils/formatters';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: RecapMetrics;
  templateTitle: string;
  totalCount: number;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  metrics,
  templateTitle,
  totalCount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const recapText = generateWhatsAppRecapText(metrics, templateTitle, totalCount);

  const handleCopy = () => {
    navigator.clipboard.writeText(recapText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(recapText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bagikan Ringkasan Rekapan</h3>
              <p className="text-xs text-slate-500">Format ringkas siap kirim ke WhatsApp / Tim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="relative">
            <textarea
              readOnly
              rows={9}
              value={recapText}
              className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 focus:outline-hidden resize-none select-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks Ringkasan'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-emerald-200"
            >
              <Send className="w-4 h-4" />
              <span>Buka di WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
