import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, PhoneCall, CheckCircle2, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { OrdersService } from '../../services/ordersService';
import { Order, OrderItem, Product } from '../../types';
import { supabase } from '../../lib/supabase';

type EditableOrder = Order & { draftItems: OrderItem[]; saving?: boolean; stockError?: string | null };

export default function Orders() {
  const [orders, setOrders] = useState<EditableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pending = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const confirmed = useMemo(() => orders.filter(o => o.status === 'confirmed'), [orders]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await OrdersService.list();
        setOrders(data.map(o => ({ ...o, draftItems: o.items.slice() })));
      } catch (e: any) {
        setError(e.message || 'No se pudieron cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateOrderDraft = (orderId: string, updater: (items: OrderItem[]) => OrderItem[]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, draftItems: updater(o.draftItems) } : o));
  };

  const persistEdits = async (order: EditableOrder) => {
    try {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: true, stockError: null } : o));
      const updated = await OrdersService.update(order.id, {
        items: order.draftItems
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...updated, draftItems: updated.items, saving: false } : o));
    } catch (e: any) {
      setError(e.message || 'No se pudo guardar el pedido');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: false } : o));
    }
  };

  const confirmOrder = async (order: EditableOrder) => {
    try {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: true, stockError: null } : o));

      // Descontar stock por item
      for (const item of order.draftItems) {
        const { data: product, error: pErr } = await supabase
          .from('products')
          .select('id, stock, name')
          .eq('id', item.productId)
          .single();
        if (pErr) throw pErr;
        const newStock = Math.max(0, (product as Product).stock - item.quantity);
        const { error: uErr } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.productId);
        if (uErr) throw uErr;
      }

      const confirmed = await OrdersService.confirm(order);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...confirmed, draftItems: confirmed.items, saving: false } : o));
    } catch (e: any) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: false, stockError: e.message || 'No se pudo confirmar' } : o));
    }
  };

  if (loading) return <div className="p-4 text-slate-500">Cargando pedidos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={26} className="text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestión de Pedidos</h2>
            <p className="text-sm text-slate-500">Pedidos capturados por WhatsApp u otros canales manuales.</p>
          </div>
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            const data = await OrdersService.list();
            setOrders(data.map(o => ({ ...o, draftItems: o.items.slice() })));
            setLoading(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <Section title="Pendientes de confirmación" items={pending} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} />
      <Section title="Confirmados" items={confirmed} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} readonly />
    </div>
  );
}

interface SectionProps {
  title: string;
  items: EditableOrder[];
  onEditItem: (orderId: string, updater: (items: OrderItem[]) => OrderItem[]) => void;
  onSave: (order: EditableOrder) => void;
  onConfirm: (order: EditableOrder) => void;
  readonly?: boolean;
}

function Section({ title, items, onEditItem, onSave, onConfirm, readonly }: SectionProps) {
  if (!items.length) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500">
        {title}: sin pedidos
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</h3>
      <div className="space-y-4">
        {items.map(order => (
          <div key={order.id} className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Cliente</p>
                    <p className="text-lg font-semibold text-slate-800">{order.customerName}</p>
                    {order.customerPhone && <p className="text-sm text-slate-500">{order.customerPhone}</p>}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span>{order.notes}</span>
                </div>
              )}

              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Artículo</th>
                      <th className="px-3 py-2 text-left w-24">Cant.</th>
                      <th className="px-3 py-2 text-left w-24">Precio</th>
                      <th className="px-3 py-2 text-left w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.draftItems.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-800">{item.name}</td>
                        <td className="px-3 py-2">
                          {readonly ? (
                            <span>{item.quantity}</span>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => onEditItem(order.id, items => items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                              className="w-20 border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">${item.price.toLocaleString()}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">
                          ${(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Total: <span className="font-bold text-slate-800">${order.draftItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  {!readonly && (
                    <>
                      <button
                        onClick={() => onSave(order)}
                        disabled={order.saving}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save size={14} /> Guardar cambios
                      </button>
                      <button
                        onClick={() => onConfirm(order)}
                        disabled={order.saving}
                        className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} /> Confirmar y descontar stock
                      </button>
                    </>
                  )}
                </div>
              </div>

              {'stockError' in order && order.stockError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{order.stockError}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
