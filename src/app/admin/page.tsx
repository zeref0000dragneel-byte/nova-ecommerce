export const dynamic = 'force-dynamic';

import { requireAuth } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import SalesChart from './components/SalesChart';

async function getStats() {
  const [productsCount, categoriesCount, ordersCount, customersCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.customer.count(),
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      total: true,
    },
  });

  return {
    productsCount,
    categoriesCount,
    ordersCount,
    customersCount,
    totalRevenue: totalRevenue._sum.total || 0,
  };
}

async function getRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  });
  return orders;
}

/** Ventas de los últimos 7 días (un punto por día) */
async function getWeeklySales(): Promise<{ day: string; ventas: number }[]> {
  const days: { date: Date; label: string; ventas: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    days.push({
      date: d,
      label: d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''),
      ventas: 0,
    });
  }

  const start = days[0].date;
  const end = new Date(days[days.length - 1].date);
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { total: true, createdAt: true },
  });

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    d.setHours(0, 0, 0, 0);
    const idx = days.findIndex((x) => x.date.getTime() === d.getTime());
    if (idx >= 0) days[idx].ventas += o.total;
  });

  return days.map(({ label, ventas }) => ({ day: label, ventas }));
}

export default async function AdminDashboard() {
  // 🔒 Verificar autenticación PRIMERO
  await requireAuth('/admin');

  const [stats, recentOrders, weeklySales] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getWeeklySales(),
  ]);

  function initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  }

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-zinc-100 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-2xl font-semibold tracking-tighter text-zinc-950">
            {stats.productsCount}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Productos</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">+0% vs mes anterior</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-2xl font-semibold tracking-tighter text-zinc-950">
            {stats.categoriesCount}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Categorías</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">+0% vs mes anterior</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-2xl font-semibold tracking-tighter text-zinc-950">
            {stats.ordersCount}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Pedidos</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">+0% vs mes anterior</p>
        </div>
        <div className="bg-white border border-zinc-100 rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-2xl font-semibold tracking-tighter text-zinc-950">
            ${stats.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1">Ingresos</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">+0% vs mes anterior</p>
        </div>
      </div>

      {/* Ventas de la semana - gráfico minimalista */}
      <section className="bg-white border border-zinc-100 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
        <h3 className="px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
          Ventas de la semana
        </h3>
        <SalesChart data={weeklySales} />
      </section>

      {/* Actividad Reciente - lista ultra-limpia */}
      <section className="bg-white border border-zinc-100 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
        <h3 className="px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-100">
          Actividad reciente
        </h3>
        <ul className="divide-y divide-zinc-50">
          {recentOrders.length === 0 ? (
            <li className="px-4 py-4 text-[12px] text-zinc-400">Sin ventas recientes</li>
          ) : (
            recentOrders.map((order) => (
              <li key={order.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-[10px] font-medium text-zinc-600">
                  {initials(order.customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-zinc-950 truncate">{order.customer.name}</p>
                  <p className="text-[12px] text-zinc-500 truncate">{order.orderNumber} · ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <span className="text-[12px] text-zinc-400 shrink-0">
                  {new Date(order.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex gap-4">
        <a href="/admin/products/new" className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950">
          + Nuevo producto
        </a>
        <a href="/admin/products" className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950">
          Productos
        </a>
        <a href="/admin/orders" className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950">
          Pedidos
        </a>
      </div>
    </div>
  );
}