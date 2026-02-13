'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminShellProps = {
  authenticated: boolean;
  children: React.ReactNode;
  logoutAction: () => void;
};

const PATH_LABELS: Record<string, string> = {
  '': 'Dashboard',
  products: 'Productos',
  categories: 'Categorías',
  orders: 'Pedidos',
  customers: 'Clientes',
  new: 'Nuevo',
  edit: 'Editar',
  login: 'Inicio de sesión',
};

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  if (pathname === '/admin' || pathname === '/admin/') {
    return [{ label: 'Home', href: '/admin' }, { label: 'Dashboard', href: '/admin' }];
  }
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/admin' }];
  let href = '/admin';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    href += `/${seg}`;
    const label = PATH_LABELS[seg] ?? (seg.length > 10 ? 'Detalle' : seg);
    crumbs.push({ label, href });
  }
  return crumbs;
}

function NavLink({ href, children, icon: Icon, collapsed }: { href: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }>; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 text-[12px] font-medium transition-colors rounded-md mx-2 ${
        isActive ? 'text-zinc-950 bg-zinc-50' : 'text-zinc-500 hover:text-zinc-700'
      }`}
    >
      <span className="flex-shrink-0 w-[14px] flex items-center justify-center">
        {isActive ? (
          <span className="w-1 h-1 rounded-full bg-zinc-950" aria-hidden />
        ) : (
          <Icon className="w-[14px] h-[14px] text-zinc-400" />
        )}
      </span>
      <span className={`truncate transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>{children}</span>
    </Link>
  );
}

export default function AdminShell({ authenticated, children, logoutAction }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!authenticated) {
    return <>{children}</>;
  }
  const pathname = usePathname(); // <--- AÑADE ESTA LÍNEA AQUÍ
  const sidebarWidth = sidebarCollapsed ? 'w-[52px]' : 'w-[200px]';
  const mainMargin = sidebarCollapsed ? 'ml-[52px]' : 'ml-[200px]';

  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header superior fijo - Autoridad de Marca */}
      <header className="sticky top-0 z-30 w-full h-12 flex items-center px-6 bg-white border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-[0.3em] text-sm text-zinc-950">NØVA</span>
          <span className="w-px h-4 bg-zinc-200" aria-hidden />
          <span className="text-sm text-zinc-400">ADMIN</span>
        </div>
      </header>

      {/* Sidebar - Ultra Minimal (debajo del header) */}
      <aside
        className={`fixed top-12 left-0 bottom-0 z-20 flex flex-col bg-white border-r border-zinc-100 text-zinc-900 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      >
        <div className={`flex items-center shrink-0 border-b border-zinc-100 transition-all duration-300 ${sidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-3'}`}>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="flex-shrink-0 p-1.5 rounded hover:bg-zinc-50 transition-colors focus:outline-none"
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </button>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider text-zinc-400 truncate transition-all duration-300 ${
              sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-hidden py-3">
          <NavLink href="/admin" collapsed={sidebarCollapsed} icon={() => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/products" collapsed={sidebarCollapsed} icon={() => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}>
            Productos
          </NavLink>
          <NavLink href="/admin/categories" collapsed={sidebarCollapsed} icon={() => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}>
            Categorías
          </NavLink>
          <NavLink href="/admin/orders" collapsed={sidebarCollapsed} icon={() => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}>
            Pedidos
          </NavLink>
          <NavLink href="/admin/customers" collapsed={sidebarCollapsed} icon={() => <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}>
            Clientes
          </NavLink>
        </nav>

        <div className="p-3 border-t border-zinc-100 shrink-0">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-transparent text-[12px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={`truncate transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Salir
              </span>
            </button>
          </form>
          <Link
            href="/"
            className="mt-1 flex items-center justify-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
            title="Volver a la tienda"
          >
            {sidebarCollapsed ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ) : (
              <span>← Tienda</span>
            )}
          </Link>
        </div>
      </aside>

      <div className={`pt-12 transition-all duration-300 ease-in-out ${mainMargin}`}>
        <main className="min-h-[calc(100vh-3rem)] p-6 max-w-6xl mx-auto bg-zinc-50/50">
          {/* Breadcrumbs sutil debajo del título de cada página */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              {breadcrumbs.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-zinc-300">/</span>}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-zinc-500 font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-zinc-600 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
