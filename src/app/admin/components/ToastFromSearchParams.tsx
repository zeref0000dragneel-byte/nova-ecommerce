'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

const TOAST_MESSAGES: Record<string, string> = {
  created: 'Creado correctamente',
  updated: 'Actualizado correctamente',
  deleted: 'Eliminado correctamente',
};

type ToastFromSearchParamsProps = {
  searchParams: Record<string, string | string[] | undefined> | null;
  messages?: Partial<Record<string, string>>;
};

export default function ToastFromSearchParams({
  searchParams,
  messages = {},
}: ToastFromSearchParamsProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const toastType = searchParams?.toast;
    if (!toastType || typeof toastType !== 'string') return;

    const message = messages[toastType] ?? TOAST_MESSAGES[toastType];
    if (message) toast.success(message);

    const url = new URL(pathname, window.location.origin);
    router.replace(url.pathname, { scroll: false });
  }, [searchParams?.toast, pathname, router, messages]);

  return null;
}
