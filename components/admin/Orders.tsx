import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, PhoneCall, CheckCircle2, Save, RefreshCw, AlertTriangle, BadgeDollarSign } from 'lucide-react';
import { OrdersService } from '../../services/ordersService';
import { Order, OrderItem, Product, OrderStatus, PaymentMethod } from '../../types';
import { supabase } from '../../lib/supabase';

type EditableOrder = Order & {
  draftItems: OrderItem[];
  saving?: boolean;
  stockError?: string | null;
  draftStatus?: OrderStatus;
  draftPaymentMethod?: PaymentMethod | null;
};

export default function Orders() {
  const [orders, setOrders] = useState<EditableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentMethod | 'none'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter === 'none' && o.paymentMethod) return false;
      if (paymentFilter !== 'all' && paymentFilter !== 'none' && o.paymentMethod !== paymentFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(o.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(o.createdAt) > to) return false;
      }
      return true;
    });
  }, [orders, statusFilter, paymentFilter, dateFrom, dateTo]);

  const pending = useMemo(() => filteredOrders.filter(o => o.status === 'pending'), [filteredOrders]);
  const confirmed = useMemo(() => filteredOrders.filter(o => o.status === 'confirmed'), [filteredOrders]);
  const paid = useMemo(() => filteredOrders.filter(o => o.status === 'paid'), [filteredOrders]);
  const cancelled = useMemo(() => filteredOrders.filter(o => o.status === 'cancelled'), [filteredOrders]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await OrdersService.list();
        setOrders(data.map(o => ({
          ...o,
          draftItems: o.items.slice(),
          draftStatus: o.status,
          draftPaymentMethod: o.paymentMethod ?? null
        })));
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

  const updateOrderMeta = (orderId: string, updates: Partial<EditableOrder>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const persistEdits = async (order: EditableOrder) => {
    try {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: true, stockError: null } : o));
      const updated = await OrdersService.update(order.id, {
        items: order.draftItems,
        status: order.draftStatus ?? order.status,
        payment_method: order.draftPaymentMethod ?? null
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...updated, draftItems: updated.items, saving: false } : o));
    } catch (e: any) {
      setError(e.message || 'No se pudo guardar el pedido');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: false } : o));
    }
  };

  const confirmOrder = async (order: EditableOrder) => {
    try {
      if (!order.draftPaymentMethod) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, stockError: 'Selecciona un método de pago antes de confirmar.' } : o));
        return;
      }
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

      const confirmed = await OrdersService.confirm({
        ...order,
        status: 'paid',
        paymentMethod: order.draftPaymentMethod
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...confirmed, draftItems: confirmed.items, saving: false } : o));
    } catch (e: any) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, saving: false, stockError: e.message || 'No se pudo confirmar' } : o));
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
        <span className="inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold uppercase tracking-wide text-[11px]">CARGANDO</span>
        <span className="text-slate-400">pedidos...</span>
      </div>
    );
  }

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
            setOrders(data.map(o => ({
              ...o,
              draftItems: o.items.slice(),
              draftStatus: o.status,
              draftPaymentMethod: o.paymentMethod ?? null
            })));
            setLoading(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 font-bold">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="paid">Pagado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 font-bold">Método</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="all">Todos</option>
              <option value="none">Sin método</option>
              <option value="cash">Efectivo</option>
              <option value="nequi">Nequi</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 font-bold">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 font-bold">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <Section title="Pendientes de confirmación" items={pending} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} onUpdateMeta={updateOrderMeta} />
      <Section title="Confirmados" items={confirmed} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} onUpdateMeta={updateOrderMeta} readonly />
      <Section title="Pagados" items={paid} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} onUpdateMeta={updateOrderMeta} readonly />
      <Section title="Cancelados" items={cancelled} onEditItem={updateOrderDraft} onSave={persistEdits} onConfirm={confirmOrder} onUpdateMeta={updateOrderMeta} readonly />
    </div>
  );
}

interface SectionProps {
  title: string;
  items: EditableOrder[];
  onEditItem: (orderId: string, updater: (items: OrderItem[]) => OrderItem[]) => void;
  onSave: (order: EditableOrder) => void;
  onConfirm: (order: EditableOrder) => void;
  onUpdateMeta: (orderId: string, updates: Partial<EditableOrder>) => void;
  readonly?: boolean;
}

function Section({ title, items, onEditItem, onSave, onConfirm, onUpdateMeta, readonly }: SectionProps) {
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
                <div className="text-sm text-slate-500 flex flex-col md:items-end gap-2">
                  <div>{new Date(order.createdAt).toLocaleString()}</div>
                  <div className="flex flex-wrap gap-2 w-full md:justify-end">
                    <select
                      value={order.draftStatus ?? order.status}
                      onChange={(e) => onUpdateMeta(order.id, { draftStatus: e.target.value as OrderStatus })}
                      disabled={readonly}
                      className="border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white w-full sm:w-auto"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="paid">Pagado</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-slate-600 w-full sm:w-auto">
                      <BadgeDollarSign size={16} />
                      <select
                        value={order.draftPaymentMethod ?? ''}
                        onChange={(e) => onUpdateMeta(order.id, { draftPaymentMethod: e.target.value ? (e.target.value as PaymentMethod) : null })}
                        disabled={readonly}
                        className="border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white w-full sm:w-auto"
                      >
                        <option value="">Sin método</option>
                        <option value="cash">Efectivo</option>
                        <option value="nequi">Nequi</option>
                      </select>
                    </div>
                  </div>
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
                              className="w-20 border border-slate-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
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

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Total: <span className="font-bold text-slate-800">${order.draftItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!readonly && (
                    <>
                      <button
                        onClick={() => onSave(order)}
                        disabled={order.saving}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2 justify-center disabled:opacity-50"
                      >
                        <Save size={14} /> Guardar cambios
                      </button>
                      <button
                        onClick={() => onConfirm(order)}
                        disabled={order.saving}
                        className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 justify-center disabled:opacity-50"
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
