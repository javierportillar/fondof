import { supabase } from '../lib/supabase'
import { DatabaseOrder, Order, OrderItem, Product } from '../types'

/**
 * Servicio para gestionar pedidos externos (ej: capturados por WhatsApp).
 * Asume tabla `orders` en Supabase con columnas:
 *  id uuid, customer_name text, customer_phone text, channel text,
 *  status text, items jsonb, notes text, created_at timestamp, confirmed_at timestamp.
 */
export const OrdersService = {
  async list(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as DatabaseOrder[]).map(this.mapDb)
  },

  async update(orderId: string, updates: Partial<DatabaseOrder>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return this.mapDb(data as DatabaseOrder)
  },

  async confirm(order: Order): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'paid', confirmed_at: new Date().toISOString() })
      .eq('id', order.id)
      .select()
      .single()

    if (error) throw error
    return this.mapDb(data as DatabaseOrder)
  },

  mapDb(db: DatabaseOrder): Order {
    return {
      id: db.id,
      userId: db.user_id ?? null,
      customerName: db.customer_name,
      customerPhone: db.customer_phone,
      channel: db.channel,
      status: db.status,
      paymentMethod: db.payment_method ?? null,
      items: db.items || [],
      notes: db.notes,
      createdAt: db.created_at,
      confirmedAt: db.confirmed_at
    }
  }
}
