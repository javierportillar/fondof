import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../types';
import { ClipboardList, Package, CreditCard } from 'lucide-react';

interface UserOrdersProps {
  userId: string;
}

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  paid: 'Pagado'
};

const statusBadge: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  paid: 'bg-blue-50 text-blue-700'
};

const paymentLabel = (method?: PaymentMethod | null) => {
  if (!method) return 'Sin método';
  return method === 'cash' ? 'Efectivo' : 'Nequi';
};

export default function UserOrders({ userId }: UserOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        const mapped = (data || []).map((o: any) => ({
          id: o.id,
          userId: o.user_id ?? null,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          channel: o.channel,
          status: o.status,
          paymentMethod: o.payment_method ?? null,
          items: o.items || [],
          notes: o.notes,
          createdAt: o.created_at,
          confirmedAt: o.confirmed_at
        })) as Order[];
        setOrders(mapped);
      } catch (e: any) {
        setError(e.message || 'No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };
    if (userId) load();
  }, [userId]);

  const empty = !loading && !error && orders.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
          <ClipboardList size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mis Pedidos</h2>
          <p className="text-slate-500">Historial y estado de tus pedidos.</p>
        </div>
      </div>

      {loading && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm">
          Cargando pedidos...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {empty && (
        <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-500">
          Aún no tienes pedidos registrados.
        </div>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white border border-slate-100 rounded-xl shadow-sm">
            <div className="p-4 md:p-6 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-50 text-slate-600 border border-slate-100">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Pedido</p>
                    <p className="text-slate-800 font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusBadge[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 flex items-center gap-1">
                    <CreditCard size={12} />
                    {paymentLabel(order.paymentMethod)}
                  </span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Artículo</th>
                      <th className="px-3 py-2 text-left w-20">Cant.</th>
                      <th className="px-3 py-2 text-left w-24">Precio</th>
                      <th className="px-3 py-2 text-left w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item: OrderItem) => (
                      <tr key={item.productId}>
                        <td className="px-3 py-2 font-medium text-slate-800">{item.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2">${item.price.toLocaleString()}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">
                          ${(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-slate-800">
                  ${order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
