
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import TableSkeleton from '../components/TableSkeleton';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  };
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/orders'
        : `/api/orders?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    PROCESSING: 'En proceso',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    PAID: 'bg-zinc-200 text-zinc-900 border border-zinc-200',
    PROCESSING: 'bg-zinc-200 text-zinc-800 border border-zinc-200',
    SHIPPED: 'bg-zinc-200 text-zinc-800 border border-zinc-200',
    DELIVERED: 'bg-zinc-300 text-zinc-900 border border-zinc-200',
    CANCELLED: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
  };

  if (loading) {
    return (
      <div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 h-9 bg-zinc-100 rounded animate-pulse" />
          <div className="h-9 w-28 bg-zinc-100 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar pedido, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-zinc-200 rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-zinc-400 w-auto"
        >
          <option value="all">Todos</option>
          <option value="PENDING">Pendiente</option>
          <option value="PAID">Pagado</option>
          <option value="PROCESSING">En proceso</option>
          <option value="SHIPPED">Enviado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50/80">
            <tr className="border-b border-zinc-100">
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Orden</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[12px] text-zinc-500">
                  No hay pedidos
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-950">{order.orderNumber}</span>
                    <div className="text-[11px] text-zinc-500">{order.items.length} productos</div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="text-[12px] font-medium text-zinc-950">{order.customer.name}</div>
                    <div className="text-[11px] text-zinc-500">{order.customer.email}</div>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <span className="text-[12px] font-medium text-zinc-950">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-6">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-6">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[12px] font-medium text-zinc-500 hover:text-zinc-950"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}