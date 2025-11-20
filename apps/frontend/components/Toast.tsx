'use client';

import { useToast } from '../contexts/toast/ToastContext';

export function Toast() {
  const { toasts, removeToast } = useToast();

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border px-4 py-3 rounded-lg shadow-lg flex items-start justify-between ${getBackgroundColor(toast.type)} animate-slide-up`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg font-bold">{getIcon(toast.type)}</span>
            <p className="text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg font-bold leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
