'use client';

import { Toaster } from 'sonner';

export default function AdminToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#fff',
          border: '1px solid #f4f4f5',
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          fontSize: '12px',
          padding: '10px 14px',
        },
        classNames: {
          toast: 'font-medium text-zinc-800',
        },
      }}
      closeButton
    />
  );
}
