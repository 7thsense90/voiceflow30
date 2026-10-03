import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage || !toastMessage.text) return null;

  const type = toastMessage.type || 'info';

  const bgClasses: Record<string, string> = {
    success: 'bg-emerald-900/90 text-white border-emerald-700',
    error: 'bg-rose-900/90 text-white border-rose-700',
    warning: 'bg-amber-900/90 text-white border-amber-700',
    info: 'bg-slate-900/90 text-white border-slate-700',
  };

  const iconMap: Record<string, React.ElementType> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const chosenBg = bgClasses[type] || bgClasses.info;
  const IconComponent = iconMap[type] || Info || null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-sm font-medium ${chosenBg}`}
      >
        {IconComponent && <IconComponent className="w-4 h-4 shrink-0 text-white" />}
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
};

export default Toast;

